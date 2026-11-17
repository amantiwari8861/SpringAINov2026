package in.iamandroid.service;

import in.iamandroid.dto.ReviewInsightsRequest;
import in.iamandroid.dto.ReviewInsightsResponse;
import in.iamandroid.dto.ReviewInsightsResponse.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Builds the "Customers say" block for a product.
 *
 * <p>The primary path asks the configured chat model for a structured summary.
 * If the model is unavailable (no key, rate limit, small local model that cannot
 * follow the JSON contract) we fall back to a deterministic keyword analysis so
 * the storefront always has something useful to show.</p>
 *
 * <p>Results are cached briefly for the same product + review text so that
 * simply re-rendering the page does not trigger another (potentially billable)
 * model call.</p>
 */
@Service
public class ReviewInsightsService {

    private static final Logger log = LoggerFactory.getLogger(ReviewInsightsService.class);

    private static final int MAX_REVIEWS = 40;
    private static final int MAX_REVIEW_CHARS = 600;
    private static final int MAX_ASPECTS = 6;
    private static final int MAX_POINTS_PER_ASPECT = 3;
    private static final int MAX_OVERALL_POINTS = 5;
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);
    private static final int CACHE_MAX_ENTRIES = 500;

    /**
     * Fixed aspect vocabulary, in display order. Keywords are matched
     * case-insensitively against the review text for the offline fallback.
     */
    private static final Map<String, List<String>> ASPECT_KEYWORDS = new LinkedHashMap<>();

    static {
        ASPECT_KEYWORDS.put("Appearance", List.of(
                "look", "looks", "design", "colour", "color", "finish", "shine",
                "beautiful", "style", "gorgeous", "pretty", "packaging", "box"));
        ASPECT_KEYWORDS.put("Value for money", List.of(
                "value", "price", "worth", "cheap", "expensive", "cost", "money", "affordable"));
        ASPECT_KEYWORDS.put("Authenticity", List.of(
                "authentic", "fake", "genuine", "original", "replica", "counterfeit", "duplicate"));
        ASPECT_KEYWORDS.put("Size", List.of(
                "size", "fit", "small", "large", "bigger", "smaller", "tight",
                "loose", "dimension", "length", "width"));
        ASPECT_KEYWORDS.put("Quality", List.of(
                "quality", "durable", "sturdy", "delicate", "tarnish", "broke",
                "broken", "flimsy", "material", "scratch", "build"));
        ASPECT_KEYWORDS.put("Comfort", List.of(
                "comfort", "comfortable", "wear", "wearing", "feel", "heavy"));
        ASPECT_KEYWORDS.put("Delivery", List.of(
                "delivery", "delivered", "arrived", "shipping", "late", "slow", "quick", "fast"));
    }

    private static final String SYSTEM_PROMPT = """
            You are a product review analyst for an e-commerce store.
            Read the customer reviews and produce a concise, neutral summary.

            Rules:
            - Use only facts stated in the reviews. Never invent products, numbers or quotes.
            - The summary must be 2 to 4 sentences in the third person, for example "Customers find...".
            - Choose at most 6 aspects from this fixed list: Appearance, Value for money, Authenticity, Size, Quality, Comfort, Delivery.
            - "count" is how many reviews discuss that aspect.
            - positives and negatives contain short verbatim phrases from the reviews (max 12 words each).
            - Give at most 3 positives and 3 negatives per aspect.
            - Use plain everyday language, no markdown, no emoji.
            - Return only JSON that matches the requested schema.
            """;

    private final ChatClient chatClient;
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();

    public ReviewInsightsService(ChatModel chatModel) {
        // A dedicated client without chat-memory advisors: review text must not
        // leak into the shopper's conversation history.
        this.chatClient = ChatClient.builder(chatModel).build();
    }

    public ReviewInsightsResponse summarize(ReviewInsightsRequest request) {
        List<ReviewInsightsRequest.Review> reviews =
                request == null || request.reviews() == null ? List.of() : request.reviews();

        List<ReviewInsightsRequest.Review> usable = reviews.stream()
                .filter(review -> review != null && review.text() != null && !review.text().isBlank())
                .toList();

        if (usable.isEmpty()) {
            return ReviewInsightsResponse.empty(
                    "There are no written reviews for this product yet. Be the first to share your experience.");
        }

        String cacheKey = cacheKey(request, usable);
        ReviewInsightsResponse cached = readCache(cacheKey);
        if (cached != null) {
            return cached;
        }

        ReviewInsightsResponse fallback = buildFallback(request, usable);
        ReviewInsightsResponse response;
        try {
            ReviewInsightsResponse ai = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user(buildUserPrompt(request, usable))
                    .call()
                    .entity(ReviewInsightsResponse.class);
            response = merge(ai, fallback, usable);
        } catch (Exception ex) {
            log.warn("AI review summary unavailable, using keyword fallback: {}", ex.getMessage());
            response = fallback;
        }

        writeCache(cacheKey, response);
        return response;
    }

    /* ------------------------------------------------------------------ */
    /* AI path                                                             */
    /* ------------------------------------------------------------------ */

    private String buildUserPrompt(ReviewInsightsRequest request, List<ReviewInsightsRequest.Review> reviews) {
        String productName = request.productName() == null || request.productName().isBlank()
                ? "this product"
                : request.productName().trim();

        StringBuilder prompt = new StringBuilder();
        prompt.append("Product: ").append(productName).append('\n');
        prompt.append("Customer reviews (").append(reviews.size()).append(" total, newest first):\n");

        int limit = Math.min(reviews.size(), MAX_REVIEWS);
        for (int i = 0; i < limit; i++) {
            ReviewInsightsRequest.Review review = reviews.get(i);
            String text = review.text().trim();
            if (text.length() > MAX_REVIEW_CHARS) {
                text = text.substring(0, MAX_REVIEW_CHARS) + "...";
            }
            prompt.append("- Rating ")
                    .append(review.rating() == null ? "unknown" : review.rating())
                    .append("/5: ")
                    .append(text)
                    .append('\n');
        }
        if (reviews.size() > limit) {
            prompt.append("- (").append(reviews.size() - limit).append(" older reviews omitted)\n");
        }
        prompt.append("\nSummarise these reviews using the required JSON schema.");
        return prompt.toString();
    }

    /**
     * Combines the model's summary with the deterministic aspect analysis.
     *
     * <p>Small local models tend to invent quotes or attach a sentence to the
     * wrong aspect. Aspect names and counts therefore always come from the
     * keyword pass; model quotes are only kept when they are grounded in the
     * actual review text and mention the aspect they were attached to.</p>
     */
    private ReviewInsightsResponse merge(ReviewInsightsResponse ai,
                                         ReviewInsightsResponse fallback,
                                         List<ReviewInsightsRequest.Review> reviews) {
        if (ai == null || ai.summary() == null || ai.summary().isBlank()) {
            return fallback;
        }

        String corpus = reviews.stream()
                .map(ReviewInsightsRequest.Review::text)
                .reduce("", (left, right) -> left + " " + right)
                .toLowerCase(Locale.ROOT);

        Map<String, Aspect> merged = new LinkedHashMap<>();
        for (Aspect aspect : fallback.aspects()) {
            merged.put(aspect.name().toLowerCase(Locale.ROOT), aspect);
        }

        if (ai.aspects() != null) {
            for (Aspect aiAspect : ai.aspects()) {
                if (aiAspect == null || aiAspect.name() == null) {
                    continue;
                }
                String key = aiAspect.name().trim().toLowerCase(Locale.ROOT);
                Aspect base = merged.get(key);
                if (base == null) {
                    continue;
                }
                merged.put(key, new Aspect(
                        base.name(),
                        base.count(),
                        groundedPoints(aiAspect.positives(), key, corpus, base.positives()),
                        groundedPoints(aiAspect.negatives(), key, corpus, base.negatives())));
            }
        }

        List<Aspect> aspects = merged.values().stream()
                .sorted(Comparator.comparingInt(Aspect::count).reversed())
                .limit(MAX_ASPECTS)
                .toList();

        return new ReviewInsightsResponse(
                ai.summary().trim(),
                aspects,
                collectPoints(aspects, true),
                collectPoints(aspects, false),
                true);
    }

    /**
     * Keeps only model quotes that mention the aspect and contain words that
     * actually occur in the reviews. Falls back to the keyword-based quotes
     * when the model did not produce anything trustworthy.
     */
    private List<String> groundedPoints(List<String> modelPoints,
                                        String aspectKey,
                                        String corpus,
                                        List<String> fallbackPoints) {
        List<String> keywords = keywordsFor(aspectKey);
        List<String> grounded = new ArrayList<>();

        for (String point : safeList(modelPoints, MAX_POINTS_PER_ASPECT)) {
            String lower = point.toLowerCase(Locale.ROOT);
            if (!containsAny(lower, keywords) || !isGrounded(point, corpus)) {
                continue;
            }
            grounded.add(point);
        }

        return grounded.isEmpty() ? fallbackPoints : List.copyOf(grounded);
    }

    private static List<String> keywordsFor(String aspectKey) {
        for (Map.Entry<String, List<String>> entry : ASPECT_KEYWORDS.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(aspectKey)) {
                return entry.getValue();
            }
        }
        return List.of();
    }

    private static boolean isGrounded(String point, String corpus) {
        String[] words = point.toLowerCase(Locale.ROOT).split("[^a-z0-9]+");
        int checked = 0;
        int found = 0;
        for (String word : words) {
            if (word.length() < 4) {
                continue;
            }
            checked++;
            if (corpus.contains(word)) {
                found++;
            }
        }
        return checked > 0 && found * 5 >= checked * 3;
    }

    private List<String> collectPoints(List<Aspect> aspects, boolean positive) {
        Map<String, String> points = new LinkedHashMap<>();
        for (Aspect aspect : aspects) {
            List<String> source = positive ? aspect.positives() : aspect.negatives();
            if (source == null) {
                continue;
            }
            for (String point : source) {
                if (points.size() >= MAX_OVERALL_POINTS) {
                    return List.copyOf(points.values());
                }
                if (point != null && !point.isBlank()) {
                    String cleaned = point.trim();
                    String normalized = normalizePoint(cleaned);
                    boolean duplicate = points.keySet().stream()
                            .anyMatch(existing -> existing.contains(normalized) || normalized.contains(existing));
                    if (!duplicate) {
                        points.put(normalized, cleaned);
                    }
                }
            }
        }
        return List.copyOf(points.values());
    }

    private static String normalizePoint(String point) {
        return point.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", " ")
                .trim();
    }

    /* ------------------------------------------------------------------ */
    /* Deterministic fallback                                              */
    /* ------------------------------------------------------------------ */

    private ReviewInsightsResponse buildFallback(ReviewInsightsRequest request,
                                                 List<ReviewInsightsRequest.Review> reviews) {
        Map<String, AspectStats> stats = new LinkedHashMap<>();
        ASPECT_KEYWORDS.keySet().forEach(name -> stats.put(name, new AspectStats()));

        int positiveReviews = 0;
        int negativeReviews = 0;

        for (ReviewInsightsRequest.Review review : reviews) {
            String text = review.text().trim();
            String lower = text.toLowerCase(Locale.ROOT);
            int rating = review.rating() == null ? 0 : review.rating();
            if (rating >= 4) {
                positiveReviews++;
            } else if (rating <= 2 && rating > 0) {
                negativeReviews++;
            }

            for (Map.Entry<String, List<String>> entry : ASPECT_KEYWORDS.entrySet()) {
                if (!containsAny(lower, entry.getValue())) {
                    continue;
                }
                AspectStats aspectStats = stats.get(entry.getKey());
                aspectStats.count++;
                String snippet = sentenceFor(text, entry.getValue());
                if (rating >= 4 && aspectStats.positives.size() < MAX_POINTS_PER_ASPECT) {
                    aspectStats.positives.add(snippet);
                } else if (rating <= 2 && rating > 0
                        && aspectStats.negatives.size() < MAX_POINTS_PER_ASPECT) {
                    aspectStats.negatives.add(snippet);
                }
            }
        }

        List<Aspect> aspects = stats.entrySet().stream()
                .filter(entry -> entry.getValue().count > 0)
                .map(entry -> new Aspect(
                        entry.getKey(),
                        entry.getValue().count,
                        List.copyOf(entry.getValue().positives),
                        List.copyOf(entry.getValue().negatives)))
                .sorted(Comparator.comparingInt(Aspect::count).reversed())
                .limit(MAX_ASPECTS)
                .toList();

        String summary = buildFallbackSummary(request, reviews.size(), positiveReviews, negativeReviews, aspects);
        return new ReviewInsightsResponse(
                summary,
                aspects,
                collectPoints(aspects, true),
                collectPoints(aspects, false),
                false);
    }

    private String buildFallbackSummary(ReviewInsightsRequest request,
                                        int total,
                                        int positiveReviews,
                                        int negativeReviews,
                                        List<Aspect> aspects) {
        String productName = request.productName() == null || request.productName().isBlank()
                ? "this product"
                : request.productName().trim();

        int positivePercent = Math.round((positiveReviews * 100f) / total);
        String overall;
        if (positivePercent >= 70) {
            overall = "most shoppers are happy with the purchase";
        } else if (negativeReviews * 100f / total >= 40) {
            overall = "opinions are divided and several shoppers were disappointed";
        } else {
            overall = "feedback is mixed, with both praise and criticism";
        }

        List<String> praised = aspects.stream()
                .filter(aspect -> !aspect.positives().isEmpty())
                .map(Aspect::name)
                .limit(2)
                .toList();
        List<String> criticised = aspects.stream()
                .filter(aspect -> !aspect.negatives().isEmpty())
                .map(Aspect::name)
                .limit(2)
                .toList();

        StringBuilder summary = new StringBuilder()
                .append("Based on ")
                .append(total)
                .append(total == 1 ? " customer review of " : " customer reviews of ")
                .append(productName)
                .append(", ")
                .append(overall)
                .append('.');

        if (!praised.isEmpty()) {
            summary.append(" Customers often praise ")
                    .append(joinNaturally(praised))
                    .append('.');
        }
        if (!criticised.isEmpty()) {
            summary.append(" ")
                    .append(joinNaturally(criticised))
                    .append(criticised.size() == 1 ? " receives" : " receive")
                    .append(" mixed or negative feedback.");
        }
        return summary.toString();
    }

    private static String joinNaturally(List<String> values) {
        if (values.size() == 1) {
            return values.get(0).toLowerCase(Locale.ROOT);
        }
        String last = values.get(values.size() - 1).toLowerCase(Locale.ROOT);
        String head = String.join(", ", values.subList(0, values.size() - 1)).toLowerCase(Locale.ROOT);
        return head + " and " + last;
    }

    private static boolean containsAny(String haystack, List<String> needles) {
        for (String needle : needles) {
            if (haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    private static String sentenceFor(String text, List<String> keywords) {
        String[] sentences = text.split("(?<=[.!?])\\s+");
        for (String sentence : sentences) {
            String lower = sentence.toLowerCase(Locale.ROOT);
            if (containsAny(lower, keywords)) {
                return trimToLength(sentence.trim());
            }
        }
        return trimToLength(text);
    }

    private static String trimToLength(String value) {
        String cleaned = value.replaceAll("\\s+", " ").trim();
        if (cleaned.length() > 140) {
            cleaned = cleaned.substring(0, 137).trim() + "...";
        }
        return cleaned;
    }

    private static List<String> safeList(List<String> values, int max) {
        if (values == null) {
            return List.of();
        }
        List<String> cleaned = new ArrayList<>();
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                cleaned.add(value.trim());
            }
            if (cleaned.size() >= max) {
                break;
            }
        }
        return List.copyOf(cleaned);
    }

    /* ------------------------------------------------------------------ */
    /* Tiny in-memory cache                                                */
    /* ------------------------------------------------------------------ */

    private String cacheKey(ReviewInsightsRequest request, List<ReviewInsightsRequest.Review> reviews) {
        int hash = 17;
        for (ReviewInsightsRequest.Review review : reviews) {
            hash = 31 * hash + (review.text() == null ? 0 : review.text().hashCode());
            hash = 31 * hash + (review.rating() == null ? 0 : review.rating());
        }
        return request.productId() + ":" + reviews.size() + ":" + Integer.toHexString(hash);
    }

    private ReviewInsightsResponse readCache(String key) {
        CacheEntry entry = cache.get(key);
        if (entry == null) {
            return null;
        }
        if (entry.createdAt().plus(CACHE_TTL).isBefore(Instant.now())) {
            cache.remove(key);
            return null;
        }
        return entry.response();
    }

    private void writeCache(String key, ReviewInsightsResponse response) {
        if (cache.size() > CACHE_MAX_ENTRIES) {
            Instant cutoff = Instant.now().minus(CACHE_TTL);
            cache.entrySet().removeIf(entry -> entry.getValue().createdAt().isBefore(cutoff));
        }
        cache.put(key, new CacheEntry(response, Instant.now()));
    }

    private record CacheEntry(ReviewInsightsResponse response, Instant createdAt) {
    }

    private static final class AspectStats {
        private int count;
        private final List<String> positives = new ArrayList<>();
        private final List<String> negatives = new ArrayList<>();
    }
}
