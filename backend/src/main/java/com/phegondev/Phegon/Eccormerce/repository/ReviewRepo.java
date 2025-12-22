package com.phegondev.Phegon.Eccormerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.phegondev.Phegon.Eccormerce.entity.Review;

import java.math.BigDecimal;
import java.util.List;

public interface ReviewRepo extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.product.id = :productId
    """)
    Double getAverageRating(@Param("productId") Long productId);
}

