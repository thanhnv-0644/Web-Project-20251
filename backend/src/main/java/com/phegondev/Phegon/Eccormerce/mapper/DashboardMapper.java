package com.phegondev.Phegon.Eccormerce.mapper;

import com.phegondev.Phegon.Eccormerce.dto.OrderByMonthDto;
import com.phegondev.Phegon.Eccormerce.dto.TopSellingProductDto;
import com.phegondev.Phegon.Eccormerce.dto.UserGrowthDto;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import com.phegondev.Phegon.Eccormerce.dto.RevenueByMonthDto;

@Component
public class DashboardMapper {

    
    public OrderByMonthDto toOrderByMonthDto(Object[] row) {
        if (row == null || row.length < 2) {
            return null;
        }

        int month = row[0] == null ? 0 : ((Number) row[0]).intValue();
        long totalOrders = row[1] == null ? 0L : ((Number) row[1]).longValue();

        return new OrderByMonthDto(month, totalOrders);
    }

   
    public TopSellingProductDto toTopProductDto(Object[] row) {
        if (row == null || row.length < 3) {
            return null;
        }

        Long productId = row[0] == null ? null : ((Number) row[0]).longValue();
        String productName = (String) row[1];
        Long totalSold = row[2] == null ? 0L : ((Number) row[2]).longValue();

        return new TopSellingProductDto(productId, productName, totalSold);
    }
  
    public UserGrowthDto toUserGrowthDto(Object[] row) {
    if (row == null || row.length < 2) {
            return null;
        }

        int month = row[0] == null ? 0 : ((Number) row[0]).intValue();
        long totalUsers = row[1] == null ? 0L : ((Number) row[1]).longValue();

        return new UserGrowthDto(month, totalUsers);
    }
 
    public RevenueByMonthDto toRevenueByMonthDto(Object[] row) {
    if (row == null || row.length < 2) {
        return null;
    }

    int month = row[0] == null ? 0 : ((Number) row[0]).intValue();
    BigDecimal revenue = row[1] == null
            ? BigDecimal.ZERO
            : (BigDecimal) row[1];

    return new RevenueByMonthDto(month, revenue);
}


}
