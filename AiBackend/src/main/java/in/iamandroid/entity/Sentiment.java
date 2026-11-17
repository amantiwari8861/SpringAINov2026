package in.iamandroid.entity;

/**
 * Sentiment label assigned to a single review by the AI classifier.
 *
 * <p>{@link #PENDING} means the model could not produce a label (model down,
 * timeout, unparseable output) or the review text was too short to classify.
 * Rows in that state are persisted as-is and can be re-classified later.</p>
 */
public enum Sentiment {
    POSITIVE,
    NEUTRAL,
    NEGATIVE,
    PENDING
}
