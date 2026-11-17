package in.iamandroid.dto;

import in.iamandroid.entity.Sentiment;

import java.util.Map;

/**
 * Sentiment breakdown for one product, used by the review filter chips.
 *
 * <p>{@code pending} counts reviews the AI could not label; they are excluded
 * from the percentage denominator so the three real labels always add up to
 * 100%.</p>
 */
public record SentimentSummaryResponse(
        long productId,
        long total,
        long positive,
        long neutral,
        long negative,
        long pending,
        double positivePercent,
        double neutralPercent,
        double negativePercent
) {

    public static SentimentSummaryResponse from(long productId, Map<Sentiment, Long> counts) {
        long positive = counts.getOrDefault(Sentiment.POSITIVE, 0L);
        long neutral = counts.getOrDefault(Sentiment.NEUTRAL, 0L);
        long negative = counts.getOrDefault(Sentiment.NEGATIVE, 0L);
        long pending = counts.getOrDefault(Sentiment.PENDING, 0L);
        long total = positive + neutral + negative + pending;

        long classified = positive + neutral + negative;
        double base = classified == 0 ? 0 : classified;

        return new SentimentSummaryResponse(
                productId,
                total,
                positive,
                neutral,
                negative,
                pending,
                percent(positive, base),
                percent(neutral, base),
                percent(negative, base));
    }

    private static double percent(long value, double base) {
        if (base == 0) {
            return 0.0;
        }
        return Math.round((value * 10000.0) / base) / 100.0;
    }
}
