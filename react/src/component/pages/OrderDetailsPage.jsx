import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import '../../style/orderDetails.css';

const OrderStatus = [
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null);
  const isAdmin = ApiService.isAdmin();

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getOrderByIdNew(orderId);
      setOrder(response.order);

      // Lấy payment info nếu có
      try {
        const paymentRes = await ApiService.getPaymentByOrder(orderId);
        if (paymentRes.success) {
          setPayment(paymentRes.data.payment);
        }
      } catch (err) {
        // Order chưa có payment
        setPayment(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể tải chi tiết đơn hàng'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (
      !window.confirm(`Bạn có chắc muốn chuyển trạng thái sang ${newStatus}?`)
    )
      return;

    try {
      await ApiService.updateOrderStatus(orderId, newStatus);
      alert('Cập nhật trạng thái thành công!');
      fetchOrderDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleConfirmDelivered = async () => {
    if (
      !window.confirm(
        'Bạn đã nhận được hàng? Xác nhận sẽ chuyển trạng thái sang ĐÃ GIAO HÀNG.'
      )
    )
      return;

    try {
      await ApiService.confirmDelivered(orderId);
      alert('Đã xác nhận nhận hàng thành công!');
      fetchOrderDetails(); // Refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xác nhận nhận hàng');
    }
  };

  if (loading)
    return (
      <div className="order-details-page">
        <p>Đang tải...</p>
      </div>
    );
  if (error)
    return (
      <div className="order-details-page">
        <p className="error">{error}</p>
      </div>
    );
  if (!order)
    return (
      <div className="order-details-page">
        <p>Không tìm thấy đơn hàng</p>
      </div>
    );

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <div className="page-header">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
          <h2>Chi tiết đơn hàng #{order.id}</h2>
        </div>

        {/* Order Summary */}
        <div className="order-summary-card">
          <div className="summary-row">
            <div className="summary-item">
              <span className="label">Trạng thái:</span>
              <span
                className={`status-badge status-${order.status?.toLowerCase()}`}
              >
                {order.status}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Tổng tiền:</span>
              <span className="value price">
                ${order.totalPrice?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="summary-item">
              <span className="label">Số sản phẩm:</span>
              <span className="value">{order.itemCount || 0}</span>
            </div>
            <div className="summary-item">
              <span className="label">Ngày đặt:</span>
              <span className="value">
                {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          {payment && (
            <div className="payment-info-box">
              <h4>Thông tin thanh toán</h4>
              <div className="payment-details">
                <span
                  className={`payment-status status-${payment.status?.toLowerCase()}`}
                >
                  {payment.status === 'PAID'
                    ? 'Đã thanh toán'
                    : payment.status === 'PENDING'
                    ? 'Chờ thanh toán'
                    : payment.status === 'AWAITING_CONFIRMATION'
                    ? 'Chờ duyệt'
                    : payment.status === 'REJECTED'
                    ? 'Bị từ chối'
                    : payment.status}
                </span>
                {!isAdmin &&
                  (payment.status === 'PENDING' ||
                    payment.status === 'REJECTED') && (
                    <button
                      className="btn-view-payment"
                      onClick={() => navigate(`/payment/${order.id}`)}
                    >
                      {payment.status === 'REJECTED'
                        ? 'Thanh toán lại'
                        : 'Xem thanh toán'}
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* User Confirm Delivered Button */}
          {!isAdmin && order.status === 'SHIPPED' && (
            <div className="confirm-delivered-box">
              <div className="confirm-content">
                <span className="confirm-icon">📦</span>
                <div className="confirm-text">
                  <h4>Đơn hàng đã được giao đến bạn?</h4>
                  <p>Nhấn nút bên dưới để xác nhận bạn đã nhận được hàng</p>
                </div>
              </div>
              <button
                className="btn-confirm-delivered"
                onClick={handleConfirmDelivered}
              >
                ✓ Đã nhận hàng
              </button>
            </div>
          )}

          {/* Admin Status Update */}
          {isAdmin && (
            <div className="status-update-box">
              <h4>Cập nhật trạng thái</h4>
              <div className="status-buttons">
                {OrderStatus.map((status) => (
                  <button
                    key={status}
                    className={`btn-status ${
                      order.status === status ? 'active' : ''
                    }`}
                    onClick={() => handleStatusChange(status)}
                    disabled={order.status === status}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Info (Admin only) */}
        {isAdmin && order.user && (
          <div className="info-card">
            <h3>👤 Thông tin khách hàng</h3>
            <div className="info-grid">
              <div className="info-row">
                <span className="label">Tên:</span>
                <span className="value">{order.user.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Email:</span>
                <span className="value">{order.user.email}</span>
              </div>
              <div className="info-row">
                <span className="label">SĐT:</span>
                <span className="value">{order.user.phoneNumber}</span>
              </div>
              {order.user.address && (
                <>
                  <div className="info-row">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{order.user.address.street}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Phường:</span>
                    <span className="value">{order.user.address.ward}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Thành phố:</span>
                    <span className="value">{order.user.address.city}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="order-items-card">
          <h3>Sản phẩm trong đơn hàng</h3>
          <div className="items-list">
            {order.orderItemList && order.orderItemList.length > 0 ? (
              order.orderItemList.map((item) => (
                <div key={item.id} className="item-card">
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.product?.name}</h4>
                    <p className="item-description">
                      {item.product?.description}
                    </p>
                    <div className="item-info">
                      <span className="item-quantity">
                        Số lượng: {item.quantity}
                      </span>
                      <span className="item-price">
                        ${item.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-items">
                Không có sản phẩm nào trong đơn hàng này
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
