package in.iamandroid.dto;

import java.util.List;

/**
 * What the "Customers say" card renders: a short summary, the aspects that
 * customers talk about, and the positive / negative points behind each aspect.
 */
public record ReviewInsightsResponse(
        String summary,
        List<Aspect> aspects,
        List<String> positives,
        List<String> negatives,
        boolean aiGenerated
) {
    public record Aspect(
            String name,
            int count,
            List<String> positives,
            List<String> negatives
    ) {
    }

    public static ReviewInsightsResponse empty(String summary) {
        return new ReviewInsightsResponse(summary, List.of(), List.of(), List.of(), false);
    }
}
