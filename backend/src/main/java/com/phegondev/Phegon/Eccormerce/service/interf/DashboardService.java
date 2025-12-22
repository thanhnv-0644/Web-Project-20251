package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface DashboardService {
    
    Response getFullDashboard(); 
    /**
     * Tổng quan dashboard
     */
    Response getSummary();

    /**
     * Doanh thu theo tháng
     */
    Response getRevenueByMonth();

    /**
     * Số lượng đơn theo tháng
     */
    Response getOrderCountByMonth();

    /**
     * Top sản phẩm bán chạy
     */
    Response getTopSellingProducts(int limit);

    /**
     * Tăng trưởng user theo tháng
     */
    Response getUserGrowth();
}
