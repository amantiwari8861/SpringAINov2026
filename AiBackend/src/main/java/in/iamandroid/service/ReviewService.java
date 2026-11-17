package in.iamandroid.service;

import in.iamandroid.dto.SentimentSummaryResponse;
import in.iamandroid.entity.Review;
import in.iamandroid.entity.Sentiment;
import in.iamandroid.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ReviewService {

    private static final int MAX_REVIEW_LENGTH = 2000;
    private static final int MAX_NAME_LENGTH = 80;
    private static final int MIN_REVIEW_LENGTH = 10;

    private final ReviewRepository reviewRepository;
    private final SentimentService sentimentService;

    public ReviewService(ReviewRepository reviewRepository, SentimentService sentimentService) {
        this.reviewRepository = reviewRepository;
        this.sentimentService = sentimentService;
    }

    /**
     * Validates and persists a review. Values coming from the browser are
     * trimmed and bounded here, and the timestamp / id / sentiment are always
     * assigned by the server so a client cannot overwrite another review.
     */
    public Review saveReview(Review review) {
        if (review == null) {
            throw new IllegalArgumentException("A review payload is required.");
        }

        String userName = review.getUserName() == null ? "" : review.getUserName().trim();
        String text = review.getReview() == null ? "" : review.getReview().trim();

        if (userName.isEmpty()) {
            throw new IllegalArgumentException("Please enter your name before posting.");
        }
        if (text.length() < MIN_REVIEW_LENGTH) {
            throw new IllegalArgumentException("Please write at least 10 characters in your review.");
        }
        if (review.getStar() < 1 || review.getStar() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
        if (review.getProductId() <= 0) {
            throw new IllegalArgumentException("A valid product is required.");
        }

        review.setReviewId(0);
        review.setUserName(userName.length() > MAX_NAME_LENGTH
                ? userName.substring(0, MAX_NAME_LENGTH)
                : userName);
        review.setReview(text.length() > MAX_REVIEW_LENGTH
                ? text.substring(0, MAX_REVIEW_LENGTH)
                : text);
        review.setReviewTimestamp(LocalDateTime.now());

        applySentiment(review);

        return reviewRepository.save(review);
    }

    /**
     * Runs the AI classifier and copies its verdict onto the review. When the
     * model is unavailable the row is stored with {@link Sentiment#PENDING} so
     * it can be labelled later instead of blocking the shopper.
     */
    private void applySentiment(Review review) {
        SentimentService.Classified classified =
                sentimentService.classify(review.getReview(), (int) review.getStar());

        review.setSentiment(classified.sentiment());
        review.setSentimentConfidence(classified.confidence());
        review.setSentimentSource(classified.source());
        review.setSentimentAt(classified.sentiment() == Sentiment.PENDING
                ? null
                : LocalDateTime.now());
    }

    public List<Review> getAllReviewsOfProduct(long prodId) {
        return reviewRepository.findAllByProductId(prodId);
    }

    /**
     * @param sentiment optional POSITIVE / NEUTRAL / NEGATIVE / PENDING filter
     */
    public List<Review> getAllReviewsOfProduct(long prodId, String sentiment) {
        if (sentiment == null || sentiment.isBlank()) {
            return getAllReviewsOfProduct(prodId);
        }
        return reviewRepository.findAllByProductIdAndSentiment(prodId, parseSentiment(sentiment));
    }

    public SentimentSummaryResponse getSentimentSummary(long prodId) {
        Map<Sentiment, Long> counts = new EnumMap<>(Sentiment.class);
        for (Sentiment value : Sentiment.values()) {
            counts.put(value, 0L);
        }

        for (Object[] row : reviewRepository.countGroupedBySentiment(prodId)) {
            // Rows written before sentiment was introduced have a null label.
            Sentiment key = row[0] == null ? Sentiment.PENDING : (Sentiment) row[0];
            counts.put(key, ((Number) row[1]).longValue());
        }

        return SentimentSummaryResponse.from(prodId, counts);
    }

    private static Sentiment parseSentiment(String raw) {
        try {
            return Sentiment.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(
                    "Unknown sentiment filter: " + raw + ". Use POSITIVE, NEUTRAL, NEGATIVE or PENDING.");
        }
    }
}
