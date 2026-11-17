package in.iamandroid.dto;

import java.util.List;

/**
 * Payload sent by the storefront when it wants an AI summary of a product's reviews.
 */
public record ReviewInsightsRequest(
        Long productId,
        String productName,
        List<Review> reviews
) {
    public record Review(
            String name,
            Integer rating,
            String text
    ) {
    }
}
