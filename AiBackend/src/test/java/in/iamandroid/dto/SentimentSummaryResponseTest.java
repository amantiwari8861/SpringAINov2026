package in.iamandroid.dto;

import in.iamandroid.entity.Sentiment;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.EnumMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Pure arithmetic tests for the sentiment breakdown.
 *
 * <p>PENDING rows are reported separately and excluded from the percentage
 * denominator, so the three real labels always add up to 100%.</p>
 */
class SentimentSummaryResponseTest {

    private static Map<Sentiment, Long> counts(long positive, long neutral, long negative, long pending) {
        Map<Sentiment, Long> counts = new EnumMap<>(Sentiment.class);
        counts.put(Sentiment.POSITIVE, positive);
        counts.put(Sentiment.NEUTRAL, neutral);
        counts.put(Sentiment.NEGATIVE, negative);
        counts.put(Sentiment.PENDING, pending);
        return counts;
    }

    @Test
    @DisplayName("percentages are computed over classified reviews only")
    void from_excludesPendingFromDenominator() {
        SentimentSummaryResponse summary =
                SentimentSummaryResponse.from(7L, counts(3, 1, 1, 5));

        assertThat(summary.total()).isEqualTo(10);
        assertThat(summary.pending()).isEqualTo(5);
        assertThat(summary.positivePercent()).isEqualTo(60.0);
        assertThat(summary.neutralPercent()).isEqualTo(20.0);
        assertThat(summary.negativePercent()).isEqualTo(20.0);
    }

    @Test
    @DisplayName("rounds percentages to two decimals")
    void from_roundsToTwoDecimals() {
        SentimentSummaryResponse summary =
                SentimentSummaryResponse.from(7L, counts(1, 1, 1, 0));

        assertThat(summary.positivePercent()).isEqualTo(33.33);
        assertThat(summary.neutralPercent()).isEqualTo(33.33);
        assertThat(summary.negativePercent()).isEqualTo(33.33);
    }

    @Test
    @DisplayName("reports a 100% single-label breakdown")
    void from_singleLabel() {
        SentimentSummaryResponse summary =
                SentimentSummaryResponse.from(7L, counts(4, 0, 0, 0));

        assertThat(summary.positivePercent()).isEqualTo(100.0);
        assertThat(summary.neutralPercent()).isZero();
    }

    @Test
    @DisplayName("returns zeros when there are no reviews at all")
    void from_emptyProduct() {
        SentimentSummaryResponse summary = SentimentSummaryResponse.from(7L, counts(0, 0, 0, 0));

        assertThat(summary.total()).isZero();
        assertThat(summary.positivePercent()).isZero();
        assertThat(summary.neutralPercent()).isZero();
        assertThat(summary.negativePercent()).isZero();
    }

    @Test
    @DisplayName("returns zeros when every review is still pending")
    void from_allPending() {
        SentimentSummaryResponse summary = SentimentSummaryResponse.from(7L, counts(0, 0, 0, 3));

        assertThat(summary.total()).isEqualTo(3);
        assertThat(summary.pending()).isEqualTo(3);
        assertThat(summary.positivePercent()).isZero();
        assertThat(summary.neutralPercent()).isZero();
        assertThat(summary.negativePercent()).isZero();
    }

    @Test
    @DisplayName("missing keys are treated as zero")
    void from_missingKeysAreZero() {
        SentimentSummaryResponse summary =
                SentimentSummaryResponse.from(7L, Map.of(Sentiment.NEGATIVE, 2L));

        assertThat(summary.total()).isEqualTo(2);
        assertThat(summary.negativePercent()).isEqualTo(100.0);
    }
}
