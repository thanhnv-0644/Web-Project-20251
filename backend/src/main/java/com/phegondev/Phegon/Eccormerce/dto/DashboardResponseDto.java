package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class DashboardResponseDto {

    private DashboardSummaryDto summary;
    private List<RevenueByMonthDto> revenueByMonth;
    private List<OrderByMonthDto> orderByMonth;
    private List<TopSellingProductDto> topProducts;
    private List<UserGrowthDto> userGrowth;
}
