package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface OrderService {
    
    // Lấy tất cả orders
    Response getAllOrders();
    
    // Lấy orders của user đang login
    Response getMyOrders();
    
    // Lấy chi tiết order by ID
    Response getOrderById(Long orderId);
    
    // Update order status (Admin)
    Response updateOrderStatus(Long orderId, String status);
    
    // User confirm delivered (chỉ cho phép SHIPPED -> DELIVERED)
    Response confirmDelivered(Long orderId);
    
    // Lấy orders theo status
    Response getOrdersByStatus(String status);
}

