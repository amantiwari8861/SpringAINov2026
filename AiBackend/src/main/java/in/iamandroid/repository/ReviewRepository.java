package in.iamandroid.repository;

import in.iamandroid.entity.Review;
import in.iamandroid.entity.Sentiment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findAllByProductId(long productId);

    List<Review> findAllByProductIdAndSentiment(long productId, Sentiment sentiment);

    /** Rows the classifier never labelled; used by the retry path. */
    List<Review> findAllBySentiment(Sentiment sentiment);

    /** Counts per sentiment for one product in a single grouped query. */
    @Query("""
            select r.sentiment, count(r)
            from Review r
            where r.productId = :productId
            group by r.sentiment
            """)
    List<Object[]> countGroupedBySentiment(@Param("productId") long productId);
}
