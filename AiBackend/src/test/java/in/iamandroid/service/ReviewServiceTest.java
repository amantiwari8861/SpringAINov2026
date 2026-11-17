package in.iamandroid.service;

import in.iamandroid.dto.SentimentSummaryResponse;
import in.iamandroid.entity.Review;
import in.iamandroid.entity.Sentiment;
import in.iamandroid.repository.ReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

/**
 * Unit tests for review validation, server-owned fields and the sentiment
 * integration. No Spring context and no database are required.
 */
@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private SentimentService sentimentService;

    private ReviewService reviewService;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewService(reviewRepository, sentimentService);
    }

    private static Review validReview() {
        Review review = new Review();
        review.setProductId(7L);
        review.setUserName("Priya");
        review.setStar((byte) 5);
        review.setReview("Great product, works exactly as described.");
        return review;
    }

    private void stubSentiment(Sentiment sentiment, Double confidence, String source) {
        when(sentimentService.classify(anyString(), any()))
                .thenReturn(new SentimentService.Classified(sentiment, confidence, source));
    }

    private void echoSave() {
        when(reviewRepository.save(any(Review.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    /* ------------------------------------------------------------------ */
    /* Sentiment handling                                                  */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("stores the AI label and ignores sentiment fields sent by the client")
    void saveReview_usesAiSentimentAndIgnoresClientValues() {
        Review input = validReview();
        input.setReviewId(999);                       // client must not pick the id
        input.setSentiment(Sentiment.NEGATIVE);       // client must not pick the label
        input.setSentimentConfidence(1.0);
        input.setSentimentSource("CLIENT_HACK");

        stubSentiment(Sentiment.POSITIVE, 0.91, SentimentService.SOURCE_AI);
        echoSave();

        Review saved = reviewService.saveReview(input);

        assertThat(saved.getReviewId()).isZero();
        assertThat(saved.getSentiment()).isEqualTo(Sentiment.POSITIVE);
        assertThat(saved.getSentimentConfidence()).isEqualTo(0.91);
        assertThat(saved.getSentimentSource()).isEqualTo(SentimentService.SOURCE_AI);
        assertThat(saved.getSentimentAt()).isNotNull();
        assertThat(saved.getReviewTimestamp()).isNotNull();
        verify(reviewRepository).save(input);
    }

    @Test
    @DisplayName("keeps the review with PENDING sentiment when the model is unavailable")
    void saveReview_storesPendingWhenAiUnavailable() {
        Review input = validReview();

        stubSentiment(Sentiment.PENDING, null, SentimentService.SOURCE_AI_UNAVAILABLE);
        echoSave();

        Review saved = reviewService.saveReview(input);

        assertThat(saved.getSentiment()).isEqualTo(Sentiment.PENDING);
        assertThat(saved.getSentimentConfidence()).isNull();
        assertThat(saved.getSentimentAt()).isNull();
        assertThat(saved.getSentimentSource()).isEqualTo(SentimentService.SOURCE_AI_UNAVAILABLE);
        assertThat(saved.getReviewTimestamp()).isNotNull();
    }

    @Test
    @DisplayName("passes the trimmed review text and the star rating to the classifier")
    void saveReview_classifiesTrimmedTextWithRating() {
        Review input = validReview();
        input.setReview("   Great product, works exactly as described.   ");

        stubSentiment(Sentiment.POSITIVE, 0.8, SentimentService.SOURCE_AI);
        echoSave();

        reviewService.saveReview(input);

        verify(sentimentService).classify("Great product, works exactly as described.", 5);
    }

    /* ------------------------------------------------------------------ */
    /* Normalisation                                                       */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("trims the author name and review body")
    void saveReview_trimsInput() {
        Review input = validReview();
        input.setUserName("   Priya   ");
        input.setReview("   Works fine and looks good.   ");

        stubSentiment(Sentiment.POSITIVE, 0.8, SentimentService.SOURCE_AI);
        echoSave();

        Review saved = reviewService.saveReview(input);

        assertThat(saved.getUserName()).isEqualTo("Priya");
        assertThat(saved.getReview()).isEqualTo("Works fine and looks good.");
    }

    @Test
    @DisplayName("bounds an over-long name to 80 chars and an over-long body to 2000")
    void saveReview_truncatesOverlongFields() {
        Review input = validReview();
        input.setUserName("n".repeat(120));
        input.setReview("x".repeat(2500));

        stubSentiment(Sentiment.POSITIVE, 0.8, SentimentService.SOURCE_AI);
        echoSave();

        Review saved = reviewService.saveReview(input);

        assertThat(saved.getUserName()).hasSize(80);
        assertThat(saved.getReview()).hasSize(2000);
    }

    /* ------------------------------------------------------------------ */
    /* Validation                                                          */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("rejects a null payload")
    void saveReview_rejectsNullPayload() {
        assertThatThrownBy(() -> reviewService.saveReview(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("payload is required");

        verifyNoInteractions(reviewRepository, sentimentService);
    }

    @Test
    @DisplayName("rejects a blank author name")
    void saveReview_rejectsBlankName() {
        Review input = validReview();
        input.setUserName("   ");

        assertThatThrownBy(() -> reviewService.saveReview(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("enter your name");

        verifyNoInteractions(reviewRepository, sentimentService);
    }

    @Test
    @DisplayName("rejects a review shorter than 10 characters")
    void saveReview_rejectsShortReview() {
        Review input = validReview();
        input.setReview("too short");

        assertThatThrownBy(() -> reviewService.saveReview(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("at least 10 characters");

        verifyNoInteractions(reviewRepository, sentimentService);
    }

    @Test
    @DisplayName("rejects ratings outside 1..5")
    void saveReview_rejectsInvalidRating() {
        Review zero = validReview();
        zero.setStar((byte) 0);
        assertThatThrownBy(() -> reviewService.saveReview(zero))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 5");

        Review six = validReview();
        six.setStar((byte) 6);
        assertThatThrownBy(() -> reviewService.saveReview(six))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 5");

        verifyNoInteractions(reviewRepository, sentimentService);
    }

    @Test
    @DisplayName("rejects a missing product id")
    void saveReview_rejectsInvalidProduct() {
        Review input = validReview();
        input.setProductId(0);

        assertThatThrownBy(() -> reviewService.saveReview(input))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("valid product");

        verifyNoInteractions(reviewRepository, sentimentService);
    }

    /* ------------------------------------------------------------------ */
    /* Reads and filtering                                                 */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("returns every review when no sentiment filter is supplied")
    void getReviews_withoutFilter_returnsAll() {
        List<Review> all = List.of(validReview());
        when(reviewRepository.findAllByProductId(7L)).thenReturn(all);

        assertThat(reviewService.getAllReviewsOfProduct(7L, "  ")).isSameAs(all);
        assertThat(reviewService.getAllReviewsOfProduct(7L, null)).isSameAs(all);

        verify(reviewRepository, never()).findAllByProductIdAndSentiment(anyLong(), any());
    }

    @Test
    @DisplayName("parses the sentiment filter case-insensitively")
    void getReviews_withFilter_parsesCaseInsensitively() {
        List<Review> negatives = List.of(validReview());
        when(reviewRepository.findAllByProductIdAndSentiment(7L, Sentiment.NEGATIVE))
                .thenReturn(negatives);

        assertThat(reviewService.getAllReviewsOfProduct(7L, "negative")).isSameAs(negatives);
    }

    @Test
    @DisplayName("rejects an unknown sentiment filter")
    void getReviews_withUnknownFilter_throws() {
        assertThatThrownBy(() -> reviewService.getAllReviewsOfProduct(7L, "banana"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Unknown sentiment filter");
    }

    /* ------------------------------------------------------------------ */
    /* Summary                                                             */
    /* ------------------------------------------------------------------ */

    @Test
    @DisplayName("counts legacy rows with a null label as PENDING and excludes them from percentages")
    void getSentimentSummary_countsNullAsPending() {
        when(reviewRepository.countGroupedBySentiment(7L)).thenReturn(List.of(
                new Object[]{Sentiment.POSITIVE, 3L},
                new Object[]{Sentiment.NEUTRAL, 1L},
                new Object[]{null, 2L}));

        SentimentSummaryResponse summary = reviewService.getSentimentSummary(7L);

        assertThat(summary.productId()).isEqualTo(7L);
        assertThat(summary.total()).isEqualTo(6);
        assertThat(summary.positive()).isEqualTo(3);
        assertThat(summary.neutral()).isEqualTo(1);
        assertThat(summary.negative()).isZero();
        assertThat(summary.pending()).isEqualTo(2);
        assertThat(summary.positivePercent()).isEqualTo(75.0);
        assertThat(summary.neutralPercent()).isEqualTo(25.0);
        assertThat(summary.negativePercent()).isZero();
    }

    @Test
    @DisplayName("returns an all-zero summary when the product has no reviews")
    void getSentimentSummary_emptyProduct() {
        when(reviewRepository.countGroupedBySentiment(7L)).thenReturn(List.of());

        SentimentSummaryResponse summary = reviewService.getSentimentSummary(7L);

        assertThat(summary.total()).isZero();
        assertThat(summary.pending()).isZero();
        assertThat(summary.positivePercent()).isZero();
    }
}
