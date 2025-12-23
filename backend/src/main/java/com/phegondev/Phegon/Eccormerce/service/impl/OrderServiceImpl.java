package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.OrderDto;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;
import com.phegondev.Phegon.Eccormerce.exception.NotFoundException;
import com.phegondev.Phegon.Eccormerce.mapper.EntityDtoMapper;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.OrderService;
import com.phegondev.Phegon.Eccormerce.service.interf.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepo orderRepo;
    private final UserService userService;
    private final EntityDtoMapper entityDtoMapper;

    @Override
    public Response getAllOrders() {
        // Lấy tất cả orders và sort theo createdAt DESC (mới nhất trước)
        List<Order> orders = orderRepo.findAllByOrderByCreatedAtDesc();
        
        List<OrderDto> orderDtoList = orders.stream()
                .map(entityDtoMapper::mapOrderToDtoWithItemsAndUser)
                .collect(Collectors.toList());
        
        return Response.builder()
                .status(200)
                .message("Lấy danh sách orders thành công")
                .orderList(orderDtoList)
                .build();
    }

    @Override
    public Response getMyOrders() {
        User user = userService.getLoginUser();
        List<Order> orders = orderRepo.findByUserOrderByCreatedAtDesc(user);
        
        List<OrderDto> orderDtoList = orders.stream()
                .map(entityDtoMapper::mapOrderToDtoWithItems)
                .collect(Collectors.toList());
        
        return Response.builder()
                .status(200)
                .message("Lấy danh sách orders của bạn thành công")
                .orderList(orderDtoList)
                .build();
    }

    @Override
    public Response getOrderById(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy order"));
        
        // Check permission: user chỉ xem được order của mình, admin xem được tất cả
        User currentUser = userService.getLoginUser();
        if (!currentUser.getRole().name().equals("ADMIN") && 
            !order.getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Bạn không có quyền xem order này");
        }
        
        OrderDto orderDto = entityDtoMapper.mapOrderToDtoWithItemsAndUser(order);
        
        return Response.builder()
                .status(200)
                .message("Lấy chi tiết order thành công")
                .order(orderDto)
                .build();
    }

    @Override
    public Response updateOrderStatus(Long orderId, String status) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy order"));
        
        OrderStatus newStatus = OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        orderRepo.save(order);
        
        return Response.builder()
                .status(200)
                .message("Cập nhật trạng thái order thành công")
                .build();
    }

    @Override
    public Response confirmDelivered(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy order"));
        
        // Check permission: chỉ user sở hữu order mới có thể confirm
        User currentUser = userService.getLoginUser();
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new NotFoundException("Bạn không có quyền xác nhận order này");
        }
        
        // Chỉ cho phép confirm khi status = SHIPPED
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new IllegalStateException("Chỉ có thể xác nhận nhận hàng khi đơn hàng đã được giao (SHIPPED)");
        }
        
        order.setStatus(OrderStatus.DELIVERED);
        orderRepo.save(order);
        
        return Response.builder()
                .status(200)
                .message("Đã xác nhận nhận hàng thành công!")
                .build();
    }

    @Override
    public Response getOrdersByStatus(String status) {
        OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
        List<Order> orders = orderRepo.findByStatusOrderByCreatedAtDesc(orderStatus);
        
        List<OrderDto> orderDtoList = orders.stream()
                .map(entityDtoMapper::mapOrderToDtoWithItemsAndUser)
                .collect(Collectors.toList());
        
        return Response.builder()
                .status(200)
                .message("Lấy danh sách orders theo status thành công")
                .orderList(orderDtoList)
                .build();
    }
}

