import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../../style/adminOrderDetails.css'
import ApiService from "../../service/ApiService";


const OrderStatus = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

const AdminOrderDetailsPage = () => {
    const { itemId } = useParams();
    const [orderItems, setOrderItems] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedStatus, setSelectedStatus] = useState({});


    useEffect(() => {
        fetchOrderDetails(itemId);
    }, [itemId]);

    const fetchOrderDetails = async (itemId) => {
        try {
            const response = await ApiService.getOrderItemById(itemId);
            setOrderItems(response.orderItemList)
        } catch (error) {
            console.log(error.message || error);
        }
    }

    const handleStatusChange = (orderItemId, newStatus) => {
        setSelectedStatus({ ...selectedStatus, [orderItemId]: newStatus })
    }

    const handleSubmitStatusChange = async (orderItemId) => {
        try {
            await ApiService.updateOrderitemStatus(orderItemId, selectedStatus[orderItemId]);
            setMessage('Cập nhật trạng thái đơn hàng thành công')
            setTimeout(() => {
                setMessage('');
            }, 3000)
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Không thể cập nhật trạng thái đơn hàng')
        }
    }


    return (
        <div className="order-details-page">
            {message && <div className="message">{message}</div>}
            <h2>Chi Tiết Đơn Hàng</h2>
            {orderItems.length ? (
                orderItems.map((orderItem) => (
                    <div key={orderItem.id} className="order-item-details">
                        <div className="info">
                            <h3>Thông Tin Đơn Hàng</h3>
                            <p><strong>Mã đơn hàng:</strong> {orderItem.id}</p>
                            <p><strong>Số lượng:</strong> {orderItem.quantity}</p>
                            <p><strong>Tổng tiền:</strong> {orderItem.price.toLocaleString('vi-VN')} VNĐ</p>
                            <p><strong>Trạng thái:</strong> {orderItem.status}</p>
                            <p><strong>Ngày đặt:</strong> {new Date(orderItem.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="info">
                            <h3>Thông Tin Khách Hàng</h3>
                            <p><strong>Họ tên:</strong> {orderItem.user.name}</p>
                            <p><strong>Email:</strong> {orderItem.user.email}</p>
                            <p><strong>Số điện thoại:</strong> {orderItem.user.phoneNumber}</p>
                            <p><strong>Vai trò:</strong> {orderItem.user.role}</p>

                            <div className="info">
                                <h3>Địa Chỉ Giao Hàng</h3>
                                <p><strong>Địa chỉ:</strong> {orderItem.user.address?.street}</p>
                                <p><strong>Phường:</strong> {orderItem.user.address?.ward}</p>
                                <p><strong>Thành phố:</strong> {orderItem.user.address?.city}</p>
                            </div>
                        </div>
                        <div>
                            <h2>Thông Tin Sản Phẩm</h2>
                            <img src={orderItem.product.imageUrl} alt={orderItem.product.name} />
                            <p><strong>Tên:</strong> {orderItem.product.name}</p>
                            <p><strong>Mô tả:</strong> {orderItem.product.description}</p>
                            <p><strong>Giá:</strong> {orderItem.product.price.toLocaleString('vi-VN')} VNĐ</p>
                        </div>
                        <div className="status-change">
                            <h4>Thay Đổi Trạng Thái</h4>
                            <select
                                className="status-option"
                                value={selectedStatus[orderItem.id] || orderItem.status}
                                onChange={(e) => handleStatusChange(orderItem.id, e.target.value)}>

                                {OrderStatus.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <button className="update-status-button" onClick={() => handleSubmitStatusChange(orderItem.id)}>Cập Nhật</button>
                        </div>
                    </div>

                ))
            ) : (
                <p>Đang tải chi tiết đơn hàng...</p>
            )}
        </div>
    );

}

export default AdminOrderDetailsPage;