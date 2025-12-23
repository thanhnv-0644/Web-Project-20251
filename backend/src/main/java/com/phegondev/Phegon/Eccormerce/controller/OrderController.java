package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.service.interf.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Lấy tất cả orders (Admin only)
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // Lấy orders của user đang login
    @GetMapping("/my-orders")
    public ResponseEntity<Response> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    // Lấy chi tiết order
    @GetMapping("/{orderId}")
    public ResponseEntity<Response> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    // Update order status (Admin only)
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status
    ) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    // User xác nhận đã nhận hàng (SHIPPED -> DELIVERED)
    @PutMapping("/{orderId}/confirm-delivered")
    public ResponseEntity<Response> confirmDelivered(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.confirmDelivered(orderId));
    }

    // Lấy orders theo status (Admin only)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Response> getOrdersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }
}

