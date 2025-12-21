package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.Order;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Long> {

    /**
     * Tổng doanh thu 
     */
    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0)
        FROM Order o
    """)
    BigDecimal getTotalRevenue();

    /**
     * Doanh thu theo tháng
     */
    @Query("""
        SELECT
            MONTH(o.createdAt),
            SUM(o.totalPrice)
        FROM Order o
        GROUP BY MONTH(o.createdAt)
        ORDER BY MONTH(o.createdAt)
    """)
    List<Object[]> revenueByMonth();

    /**
     * Số đơn theo tháng
     */
    @Query("""
    SELECT
        MONTH(o.createdAt),
        COUNT(o)
    FROM Order o
    GROUP BY MONTH(o.createdAt)
    ORDER BY MONTH(o.createdAt)
    """)
    List<Object[]> orderCountByMonth();

}
