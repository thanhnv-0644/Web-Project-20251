package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.*;
import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;
import com.phegondev.Phegon.Eccormerce.mapper.DashboardMapper;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.OrderItemRepo;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderItemRepo orderItemRepo;
    private final OrderRepo orderRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;
    private final DashboardMapper dashboardMapper;

    @Override
    public Response getFullDashboard() {

        // SUMMARY
        BigDecimal totalRevenue =
                orderItemRepo.getTotalRevenue(OrderStatus.DELIVERED);

        DashboardSummaryDto summary = new DashboardSummaryDto(
                totalRevenue == null ? BigDecimal.ZERO : totalRevenue,
                orderRepo.count(),
                userRepo.count(),
                productRepo.count()
        );

        // REVENUE BY MONTH
        List<RevenueByMonthDto> revenueByMonth =
                orderItemRepo.revenueByMonth(OrderStatus.DELIVERED)
                        .stream()
                        .map(dashboardMapper::toRevenueByMonthDto)
                        .toList();

        // ORDER COUNT BY MONTH
        List<OrderByMonthDto> orderByMonth =
                orderRepo.orderCountByMonth()
                        .stream()
                        .map(dashboardMapper::toOrderByMonthDto)
                        .toList();

        // TOP PRODUCTS
        List<TopSellingProductDto> topProducts =
                orderItemRepo.findTopSellingProducts(
                        OrderStatus.DELIVERED,
                        PageRequest.of(0, 5)
                ).stream()
                 .map(dashboardMapper::toTopProductDto)
                 .toList();

        // USER GROWTH
        List<UserGrowthDto> userGrowth =
                userRepo.userGrowthByMonth()
                        .stream()
                        .map(dashboardMapper::toUserGrowthDto)
                        .toList();

        return Response.builder()
                .status(200)
                .message("Dashboard data fetched successfully")
                .dashboard(new DashboardResponseDto(
                        summary,
                        revenueByMonth,
                        orderByMonth,
                        topProducts,
                        userGrowth
                ))
                .build();
    }

    

    @Override public Response getSummary() { return getFullDashboard(); }
    @Override public Response getRevenueByMonth() { return getFullDashboard(); }
    @Override public Response getOrderCountByMonth() { return getFullDashboard(); }
    @Override public Response getTopSellingProducts(int limit) { return getFullDashboard(); }
    @Override public Response getUserGrowth() { return getFullDashboard(); }
}
