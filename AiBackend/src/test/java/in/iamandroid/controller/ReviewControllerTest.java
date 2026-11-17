package in.iamandroid.controller;

import in.iamandroid.dto.SentimentSummaryResponse;
import in.iamandroid.entity.Review;
import in.iamandroid.entity.Sentiment;
import in.iamandroid.service.ReviewInsightsService;
import in.iamandroid.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Plain unit tests for the review endpoints: delegation and error mapping.
 * MockMvc wiring is intentionally left out so the tests stay fast and free of
 * a running database.
 */
class ReviewControllerTest {

    private ReviewService reviewService;
    private ReviewInsightsService reviewInsightsService;
    private ReviewController controller;

    @BeforeEach
    void setUp() {
        reviewService = mock(ReviewService.class);
        reviewInsightsService = mock(ReviewInsightsService.class);
        controller = new ReviewController(reviewService, reviewInsightsService);
    }

    @Test
    @DisplayName("POST delegates the payload to the service")
    void review_delegatesToService() {
        Review input = new Review();
        Review saved = new Review();
        saved.setReviewId(1L);

        when(reviewService.saveReview(input)).thenReturn(saved);

        assertThat(controller.review(input)).isSameAs(saved);
    }

    @Test
    @DisplayName("GET passes the optional sentiment filter through")
    void reviews_passesSentimentFilter() {
        List<Review> rows = List.of(new Review());
        when(reviewService.getAllReviewsOfProduct(7L, "NEGATIVE")).thenReturn(rows);

        assertThat(controller.reviews(7L, "NEGATIVE")).isSameAs(rows);
        verify(reviewService).getAllReviewsOfProduct(7L, "NEGATIVE");
    }

    @Test
    @DisplayName("GET without a filter still reaches the service")
    void reviews_withoutFilter() {
        List<Review> rows = List.of();
        when(reviewService.getAllReviewsOfProduct(7L, null)).thenReturn(rows);

        assertThat(controller.reviews(7L, null)).isSameAs(rows);
    }

    @Test
    @DisplayName("GET /sentiment/summary delegates to the service")
    void sentimentSummary_delegates() {
        SentimentSummaryResponse summary = SentimentSummaryResponse.from(7L, Map.of(Sentiment.POSITIVE, 2L));
        when(reviewService.getSentimentSummary(7L)).thenReturn(summary);

        assertThat(controller.sentimentSummary(7L)).isSameAs(summary);
    }

    @Test
    @DisplayName("invalid input is mapped to 400 with a readable error body")
    void handleBadRequest_returns400() {
        ResponseEntity<Map<String, String>> response =
                controller.handleBadRequest(new IllegalArgumentException("Rating must be between 1 and 5."));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody())
                .containsEntry("error", "Rating must be between 1 and 5.");
    }
}
