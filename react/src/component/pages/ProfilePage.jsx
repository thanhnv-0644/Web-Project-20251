import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/profile.css';
import Pagination from "../common/Pagination";

const ProfilePage = () => {

    const [userInfo, setUserInfo] = useState(null);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const navigate = useNavigate();
    const isAdmin = ApiService.isAdmin();


    useEffect(() => {

        fetchUserInfo();
    }, []);
    const fetchUserInfo = async () => {

        try {
            const response = await ApiService.getLoggedInUserInfo();
            setUserInfo(response.user);
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Unable to fetch user info');
        }
    }

    if (!userInfo) {
        return <div>Loading...</div>
    }

    const handleAddressClick = () => {
        navigate(userInfo.address ? '/edit-address' : '/add-address');
    }

    const orderItemList = userInfo.orderItemList || [];

    const totalPages = Math.ceil(orderItemList.length / itemsPerPage);

    const paginatedOrders = orderItemList.slice(
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
                            </div>

                            {!isAdmin && (
                                <div className="info-card">
                                    <h3>Địa Chỉ Giao Hàng</h3>
                                    {userInfo.address ? (
                                        <div className="address-info">
                                            <div className="info-row">
                                                <span className="info-label">Đường:</span>
                                                <span className="info-value">{userInfo.address.street}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Thành phố:</span>
                                                <span className="info-value">{userInfo.address.city}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Tỉnh/Bang:</span>
                                                <span className="info-value">{userInfo.address.state}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Mã bưu điện:</span>
                                                <span className="info-value">{userInfo.address.zipCode}</span>
                                            </div>
                                            <div className="info-row">
                                                <span className="info-label">Quốc gia:</span>
                                                <span className="info-value">{userInfo.address.country}</span>
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
                                {orderItemList.length === 0 ? (
                                    <p className="no-orders">Bạn chưa có đơn hàng nào</p>
                                ) : (
                                    <>
                                        <div className="orders-list">
                                            {paginatedOrders.map(order => (
                                                <div key={order.id} className="order-item">
                                                    <img src={order.product?.imageUrl} alt={order.product.name} />
                                                    <div className="order-details">
                                                        <h4>{order.product.name}</h4>
                                                        <div className="order-info">
                                                            <span className={`status-badge status-${order.status.toLowerCase()}`}>
                                                                {order.status}
                                                            </span>
                                                            <span className="order-quantity">Số lượng: {order.quantity}</span>
                                                            <span className="order-price">${order.price.toFixed(2)}</span>
                                                        </div>
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