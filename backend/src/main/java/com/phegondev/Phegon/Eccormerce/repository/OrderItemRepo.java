package com.phegondev.Phegon.Eccormerce.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.phegondev.Phegon.Eccormerce.entity.OrderItem;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;

public interface OrderItemRepo
        extends JpaRepository<OrderItem, Long>,
                JpaSpecificationExecutor<OrderItem> {

    /**
     * Top sản phẩm bán chạy (chỉ tính đơn DELIVERED)
     * Status giờ nằm ở Order entity
     */
    @Query("""
    SELECT p.id, p.name, SUM(oi.quantity)
    FROM OrderItem oi
    JOIN oi.product p
    JOIN oi.order o
    WHERE o.status = :status
    GROUP BY p.id, p.name
    ORDER BY SUM(oi.quantity) DESC
    """)
    List<Object[]> findTopSellingProducts(
        @Param("status") OrderStatus status,
        Pageable pageable
);


    /**
     * Tổng doanh thu
     * Status giờ nằm ở Order entity
     */
    @Query("""
        SELECT SUM(oi.price * oi.quantity)
        FROM OrderItem oi
        JOIN oi.order o
        WHERE o.status = :status
    """)
    BigDecimal getTotalRevenue(@Param("status") OrderStatus status);

    /**
     * Doanh thu theo tháng
     * Status giờ nằm ở Order entity
     */
    @Query("""
    SELECT
        MONTH(oi.createdAt),
        SUM(oi.price * oi.quantity)
    FROM OrderItem oi
    JOIN oi.order o
    WHERE o.status = :status
    GROUP BY MONTH(oi.createdAt)
    ORDER BY MONTH(oi.createdAt)
""")
List<Object[]> revenueByMonth(@Param("status") OrderStatus status);

}
