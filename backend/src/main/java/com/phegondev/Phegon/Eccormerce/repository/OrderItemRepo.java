package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.OrderItem;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface OrderItemRepo
        extends JpaRepository<OrderItem, Long>,
                JpaSpecificationExecutor<OrderItem> {

    /**
     * Top sản phẩm bán chạy (chỉ tính đơn DELIVERED)
     */
    @Query("""
    SELECT p.id, p.name, SUM(oi.quantity)
    FROM OrderItem oi
    JOIN oi.product p
    WHERE oi.status = :status
    GROUP BY p.id, p.name
    ORDER BY SUM(oi.quantity) DESC
    """)
    List<Object[]> findTopSellingProducts(
        @Param("status") OrderStatus status,
        Pageable pageable
);


    /**
     * Tổng doanh thu
     */
    @Query("""
        SELECT SUM(oi.price * oi.quantity)
        FROM OrderItem oi
        WHERE oi.status = :status
    """)
    BigDecimal getTotalRevenue(@Param("status") OrderStatus status);

    /**
     * Doanh thu theo tháng
     */
    @Query("""
    SELECT
        MONTH(oi.createdAt),
        SUM(oi.price * oi.quantity)
    FROM OrderItem oi
    WHERE oi.status = :status
    GROUP BY MONTH(oi.createdAt)
    ORDER BY MONTH(oi.createdAt)
""")
List<Object[]> revenueByMonth(@Param("status") OrderStatus status);

}
