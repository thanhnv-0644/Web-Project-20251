package com.phegondev.Phegon.Eccormerce.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;

public interface OrderRepo extends JpaRepository<Order, Long> {
    
    // Lấy tất cả orders, sorted by createdAt desc (mới nhất trước)
    List<Order> findAllByOrderByCreatedAtDesc();
    
    // Lấy orders của user, sorted by createdAt desc
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    
    // Lấy orders theo status
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    /**
     * Tổng doanh thu 
     */
    @Query("""
        SELECT COALESCE(SUM(o.totalPrice), 0)
        FROM Order o
    """)
    BigDecimal getTotalRevenue();

    /**
     * Doanh thu theo tháng (tất cả orders)
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
     * Doanh thu theo tháng (chỉ orders DELIVERED)
     */
    @Query("""
        SELECT
            MONTH(o.createdAt),
            SUM(o.totalPrice)
        FROM Order o
        WHERE o.status = :status
        GROUP BY MONTH(o.createdAt)
        ORDER BY MONTH(o.createdAt)
    """)
    List<Object[]> revenueByMonthWithStatus(OrderStatus status);

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
