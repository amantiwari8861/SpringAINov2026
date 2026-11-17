package in.iamandroid.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="reviews")
@Data
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long reviewId;
    @Column(nullable = false, length = 2000)
    private String review;
    @Column(nullable = false)
    private byte star;
    private String userName;
    private long productId;
    private LocalDateTime reviewTimestamp;

    /** AI sentiment label. PENDING means the model could not label this row yet. */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Sentiment sentiment;

    /** The model's own certainty (0.0 - 1.0). Null when the label is PENDING. */
    @Column(name = "sentiment_confidence")
    private Double sentimentConfidence;

    /** Where the label came from: AI, AI_UNAVAILABLE or INVALID_TEXT. */
    @Column(name = "sentiment_source", length = 30)
    private String sentimentSource;

    /** When the AI last labelled this row. Null while PENDING. */
    @Column(name = "sentiment_at")
    private LocalDateTime sentimentAt;
}