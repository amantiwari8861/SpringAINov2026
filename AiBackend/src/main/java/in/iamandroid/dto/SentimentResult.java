package in.iamandroid.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import in.iamandroid.entity.Sentiment;

/**
 * Structured-output contract for the sentiment classifier.
 *
 * <p>The model is asked to return exactly this JSON shape. Case-insensitive
 * enum matching keeps the parser tolerant of "Positive" / "positive" replies
 * from smaller local models.</p>
 */
public record SentimentResult(
        @JsonFormat(
                shape = JsonFormat.Shape.STRING,
                with = JsonFormat.Feature.ACCEPT_CASE_INSENSITIVE_VALUES)
        Sentiment sentiment,
        Double confidence
) {
}
