import React, { useEffect, useState } from "react";
import ApiService from "../../service/ApiService";
import {
    LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "../../style/dashboard.css";

const DashboardPage = () => {

    const [summary, setSummary] = useState(null);
    const [revenueByMonth, setRevenueByMonth] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const res = await ApiService.get("/api/admin/dashboard");
            const dashboard = res.data?.dashboard;

            if (!dashboard) return;

            setSummary(dashboard.summary);
            setRevenueByMonth(dashboard.revenueByMonth || []);
            setTopProducts(dashboard.topProducts || []);
            setUserGrowth(dashboard.userGrowth || []);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading dashboard...</p>;
    if (!summary) return <p>No data</p>;

    return (
        <div className="dashboard-page">
            <h2>📊 Admin Dashboard</h2>

            <div className="dashboard-cards">
                <div className="card">Revenue: ${summary.totalRevenue}</div>
                <div className="card">Orders: {summary.totalOrders}</div>
                <div className="card">Users: {summary.totalUsers}</div>
                <div className="card">Products: {summary.totalProducts}</div>
            </div>

            <div className="dashboard-charts">
                <div className="chart-card">
                    <h3>Revenue By Month</h3>
                    {revenueByMonth.length === 0 ? (
                        <p>No data</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line dataKey="revenue" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="chart-card">
                    <h3>Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topProducts}>
                            <XAxis dataKey="productName" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="totalSold" fill="#4f46e5"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <h3>User Growth</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowth}>
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line dataKey="totalUsers" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
