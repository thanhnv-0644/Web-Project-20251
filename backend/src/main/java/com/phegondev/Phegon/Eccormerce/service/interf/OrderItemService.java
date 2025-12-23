package com.phegondev.Phegon.Eccormerce.service.interf;

import java.time.LocalDateTime;

import org.springframework.data.domain.Pageable;

import com.phegondev.Phegon.Eccormerce.dto.OrderRequest;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;

public interface OrderItemService {
    Response placeOrder(OrderRequest orderRequest);
    
    @Deprecated
    Response updateOrderItemStatus(Long orderItemId, String status);
    
    Response filterOrderItems(OrderStatus status, LocalDateTime startDate, LocalDateTime endDate, Long itemId, Pageable pageable);
}
