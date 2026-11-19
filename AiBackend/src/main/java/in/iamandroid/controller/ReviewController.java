package in.iamandroid.controller;

import in.iamandroid.dto.ReviewInsightsRequest;
import in.iamandroid.dto.ReviewInsightsResponse;
import in.iamandroid.dto.SentimentSummaryResponse;
import in.iamandroid.entity.Review;
import in.iamandroid.service.ReviewInsightsService;
import in.iamandroid.service.ReviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Review endpoints.
 *
 * <p>POST /api/v1/reviews stores a review for a product, together with the AI
 * sentiment label (POSITIVE / NEUTRAL / NEGATIVE, or PENDING when the model is
 * unavailable).<br>
 * GET /api/v1/reviews?productId=1 returns the reviews stored for that product;
 * add &amp;sentiment=NEGATIVE to filter by label.<br>
 * GET /api/v1/reviews/sentiment/summary?productId=1 returns the per-label
 * counts used by the filter chips.<br>
 * POST /api/v1/reviews/insights powers the "Customers say" card.</p>
 */
@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewInsightsService reviewInsightsService;

    public ReviewController(ReviewService reviewService, ReviewInsightsService reviewInsightsService) {
        this.reviewService = reviewService;
        this.reviewInsightsService = reviewInsightsService;
    }

    @PostMapping
    public Review review(@RequestBody Review review) {
        return reviewService.saveReview(review);
    }

    @GetMapping
    public List<Review> reviews(@RequestParam("productId") long productId,
                                @RequestParam(value = "sentiment", required = false) String sentiment) {
        return reviewService.getAllReviewsOfProduct(productId, sentiment);
    }

    @GetMapping("/sentiment/summary")
    public SentimentSummaryResponse sentimentSummary(@RequestParam("productId") long productId) {
        return reviewService.getSentimentSummary(productId);
    }

    @PostMapping("/insights")
    public ReviewInsightsResponse insights(@RequestBody(required = false) ReviewInsightsRequest request) {
        return reviewInsightsService.summarize(request);
    }

    /**
     * Turns invalid review payloads into a 400 with a readable message instead
     * of a generic 500, so the storefront can show it to the shopper.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", exception.getMessage()));
    }
}
