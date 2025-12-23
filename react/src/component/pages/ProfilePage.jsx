import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import Pagination from "../common/Pagination";
import '../../style/profile.css';

const ProfilePage = () => {

    const [userInfo, setUserInfo] = useState(null);
    const [orders, setOrders] = useState([]); // Danh sách orders
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [orderPayments, setOrderPayments] = useState({}); // Lưu payment status cho mỗi order
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();


    useEffect(() => {

        fetchUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    const fetchUserInfo = async () => {

        try {
            // Lấy thông tin user
            const userResponse = await ApiService.getLoggedInUserInfo();
            setUserInfo(userResponse.user);
            
            // Lấy danh sách orders
            const ordersResponse = await ApiService.getMyOrders();
            const orderList = ordersResponse.orderList || [];
            setOrders(orderList);
            
            // Lấy payment status cho mỗi order
            if (orderList.length > 0) {
                const payments = {};
                
                // Fetch payment cho mỗi order
                await Promise.all(orderList.map(async (order) => {
                    try {
                        const paymentRes = await ApiService.getPaymentByOrder(order.id);
                        if (paymentRes.success) {
                            payments[order.id] = paymentRes.data.payment;
                        }
                    } catch (err) {
                        // Order chưa có payment
                        payments[order.id] = null;
                    }
                }));
                
                setOrderPayments(payments);
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Không thể tải thông tin người dùng');
        }
    }

    if (!userInfo) {
        return <div>Đang tải...</div>
    }

    const handleAddressClick = () => {
        navigate(userInfo.address ? '/edit-address' : '/add-address');
    }

    // Orders đã được sắp xếp từ backend
    const totalPages = Math.ceil(orders.length / itemsPerPage);

    const paginatedOrders = orders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );




    return (
        <div className="profile-page">
            <div className="profile-container">
                <h2>Xin chào, {userInfo.name}!</h2>

                {error ? (
                    <p className="error-message">{error}</p>
                ) : (
                    <div className="profile-content">
                        <div className={`profile-info-section ${isAdmin ? 'admin-layout' : ''}`}>
                            <div className="info-card">
                                <h3>Thông Tin Cá Nhân</h3>
                                <div className="info-row">
                                    <span className="info-label">Họ tên:</span>
                                    <span className="info-value">{userInfo.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{userInfo.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Số điện thoại:</span>
                                    <span className="info-value">{userInfo.phoneNumber}</span>
                                </div>
                                {isAdmin && (
                                    <div className="info-row">
                                        <span className="info-label">Vai trò:</span>
                                        <span className="info-value admin-badge">Quản trị viên</span>
                                    </div>
                                )}
                                <button 
                                    className="profile-button"
                                    onClick={() => navigate('/edit-profile')}
                                >
                                    Chỉnh sửa
                                </button>
                            </div>

                            {!isAdmin && (
                                <div className="info-card">
                                    <h3>Địa Chỉ Giao Hàng</h3>
                                    {userInfo.address ? (
                                        <div className="address-info">
                                            <div className="info-row">
                                                <span className="info-label">Địa chỉ:</span>
                                                <span className="info-value">{userInfo.address.street}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Phường:</span>
                                                <span className="info-value">{userInfo.address.ward}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Thành phố:</span>
                                                <span className="info-value">{userInfo.address.city}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="no-address">Chưa có thông tin địa chỉ</p>
                                    )}
                                    <button className="profile-button" onClick={handleAddressClick}>
                                        {userInfo.address ? "Chỉnh Sửa Địa Chỉ" : "Thêm Địa Chỉ"}
                                    </button>
                                </div>
                            )}
                        </div>

                        {!isAdmin && (
                            <div className="order-history-section">
                                <h3>Lịch Sử Đơn Hàng</h3>
                                {orders.length === 0 ? (
                                    <p className="no-orders">Bạn chưa có đơn hàng nào</p>
                                ) : (
                                    <>
                                        <div className="orders-list">
                                            {paginatedOrders.map(order => (
                                                <div key={order.id} className="order-card" onClick={() => navigate(`/order-details/${order.id}`)}>
                                                    <div className="order-header">
                                                        <h4>Đơn hàng #{order.id}</h4>
                                                        <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="order-info">
                                                        <span className="order-items">📦 {order.itemCount || 0} sản phẩm</span>
                                                        <span className="order-price">💰 ${order.totalPrice?.toFixed(2) || '0.00'}</span>
                                                    </div>
                                                    <div className="order-date">
                                                        <span className="date-label">📅 Ngày đặt:</span>
                                                        <span className="date-value">
                                                            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {/* Nút xem thanh toán */}
                                                    <div className="order-payment-info" onClick={(e) => e.stopPropagation()}>
                                                        {orderPayments[order.id] ? (
                                                            <>
                                                                <span className={`payment-status status-${orderPayments[order.id].status.toLowerCase()}`}>
                                                                    💳 {orderPayments[order.id].status === 'PAID' ? 'Đã thanh toán' : 
                                                                       orderPayments[order.id].status === 'REJECTED' ? 'Bị từ chối' :
                                                                       orderPayments[order.id].status === 'PENDING' ? 'Chờ thanh toán' :
                                                                       orderPayments[order.id].status === 'AWAITING_CONFIRMATION' ? 'Chờ duyệt' : 
                                                                       orderPayments[order.id].status}
                                                                </span>
                                                                {(orderPayments[order.id].status === 'PENDING' || 
                                                                  orderPayments[order.id].status === 'REJECTED' ||
                                                                  orderPayments[order.id].status === 'AWAITING_CONFIRMATION') && (
                                                                    <button 
                                                                        className="btn-view-payment"
                                                                        onClick={() => navigate(`/payment/${order.id}`)}
                                                                    >
                                                                        {orderPayments[order.id].status === 'REJECTED' ? 'Thanh toán lại' : 'Xem thanh toán'}
                                                                    </button>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <button 
                                                                className="btn-create-payment"
                                                                onClick={() => navigate(`/payment/${order.id}`)}
                                                            >
                                                                Tạo thanh toán
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(page) => setCurrentPage(page)} />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfilePage;