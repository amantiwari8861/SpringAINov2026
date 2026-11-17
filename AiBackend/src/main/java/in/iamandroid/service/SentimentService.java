package in.iamandroid.service;

import in.iamandroid.dto.SentimentResult;
import in.iamandroid.entity.Sentiment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Classifies a single review as POSITIVE / NEGATIVE / NEUTRAL using the
 * configured chat model.
 *
 * <p>Design rules:</p>
 * <ul>
 *   <li>Never throws. A model outage must not stop a shopper from posting a
 *       review, so failures return {@link Sentiment#PENDING} and the row is
 *       stored in that state for a later retry.</li>
 *   <li>No chat-memory advisors are attached: review text must not leak into
 *       the shopper's conversation history.</li>
 *   <li>Only successful classifications are cached, so a brief outage does not
 *       pin a review to PENDING for the whole cache window.</li>
 * </ul>
 */
@Service
public class SentimentService {

    private static final Logger log = LoggerFactory.getLogger(SentimentService.class);

    public static final String SOURCE_AI = "AI";
    public static final String SOURCE_AI_UNAVAILABLE = "AI_UNAVAILABLE";
    public static final String SOURCE_INVALID_TEXT = "INVALID_TEXT";

    private static final int MIN_TEXT_LENGTH = 4;
    private static final int MAX_TEXT_CHARS = 2000;
    private static final Duration CACHE_TTL = Duration.ofMinutes(30);
    private static final int CACHE_MAX_ENTRIES = 1000;

    private static final String SYSTEM_PROMPT = """
            You classify e-commerce customer reviews by sentiment.
            Return exactly one label: POSITIVE, NEGATIVE or NEUTRAL.

            Rules:
            - Judge the meaning of the review text.
            - The star rating is only a hint and must not override clear text.
            - Sarcasm counts as NEGATIVE.
            - If a review contains both praise and complaints, use the side that clearly dominates;
              use NEUTRAL only when neither side dominates.
            - Complaints about delivery, packaging, size or price still describe the purchase
              and therefore count.
            - The text may be English, Hindi or Hinglish. Classify the intent, not the language.
            - "confidence" is your own certainty, a number between 0.0 and 1.0.

            Return only JSON in this shape:
            {"sentiment":"POSITIVE","confidence":0.9}
            """;

    private final ChatClient chatClient;
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    public SentimentService(ChatModel chatModel) {
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    /**
     * Classifies one review. Always returns a usable result.
     *
     * @param text   review body as written by the shopper
     * @param rating star rating (1-5) used only as a hint for the model
     */
    public Classified classify(String text, Integer rating) {
        String clean = text == null ? "" : text.trim();

        if (clean.length() < MIN_TEXT_LENGTH) {
            return new Classified(Sentiment.PENDING, null, SOURCE_INVALID_TEXT);
        }

        String key = cacheKey(clean);
        Classified cached = readCache(key);
        if (cached != null) {
            return cached;
        }

        Classified result;
        try {
            SentimentResult raw = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(buildUserPrompt(clean, rating))
                    .call()
                    .entity(SentimentResult.class);

            result = normalize(raw);
        } catch (Exception ex) {
            log.warn("Sentiment model unavailable, storing review as PENDING: {}", ex.getMessage());
            result = new Classified(Sentiment.PENDING, null, SOURCE_AI_UNAVAILABLE);
        }

        // Cache only real labels; a transient failure should be retried next time.
        if (result.sentiment() != Sentiment.PENDING) {
            writeCache(key, result);
        }
        return result;
    }

    private Classified normalize(SentimentResult raw) {
        if (raw == null || raw.sentiment() == null || raw.sentiment() == Sentiment.PENDING) {
            return new Classified(Sentiment.PENDING, null, SOURCE_AI_UNAVAILABLE);
        }

        Double confidence = raw.confidence() == null
                ? null
                : Math.max(0.0, Math.min(1.0, raw.confidence()));

        return new Classified(raw.sentiment(), confidence, SOURCE_AI);
    }

    private static String buildUserPrompt(String text, Integer rating) {
        String clipped = text.length() > MAX_TEXT_CHARS
                ? text.substring(0, MAX_TEXT_CHARS)
                : text;

        return "Star rating: " + (rating == null ? "unknown" : rating) + "/5\n"
                + "Review:\n"
                + clipped;
    }

    private static String cacheKey(String text) {
        return Integer.toHexString(text.toLowerCase(Locale.ROOT).hashCode());
    }

    private Classified readCache(String key) {
        Cached entry = cache.get(key);
        if (entry == null) {
            return null;
        }
        if (entry.createdAt().plus(CACHE_TTL).isBefore(Instant.now())) {
            cache.remove(key, entry);
            return null;
        }
        return entry.value();
    }

    private void writeCache(String key, Classified value) {
        if (cache.size() >= CACHE_MAX_ENTRIES) {
            Instant cutoff = Instant.now().minus(CACHE_TTL);
            cache.entrySet().removeIf(entry -> entry.getValue().createdAt().isBefore(cutoff));
            if (cache.size() >= CACHE_MAX_ENTRIES) {
                cache.clear();
            }
        }
        cache.put(key, new Cached(value, Instant.now()));
    }

    /** Result of a classification attempt, ready to be stored on the Review row. */
    public record Classified(Sentiment sentiment, Double confidence, String source) {
    }

    private record Cached(Classified value, Instant createdAt) {
    }
}
