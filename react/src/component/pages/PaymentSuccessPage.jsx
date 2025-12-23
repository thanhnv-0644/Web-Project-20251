import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../../style/payment.css';

const PaymentSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { dispatch } = useCart();

  useEffect(() => {
    // Clear cart khi thanh toán thành công
    const pendingOrderId = localStorage.getItem('pendingOrderId');
    if (pendingOrderId === orderId) {
      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingCart');
    }
    // Có thể thêm confetti animation hoặc sound effect
  }, [orderId, dispatch]);

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Thanh toán thành công!</h1>
        <p className="success-message">
          Đơn hàng <strong>#{orderId}</strong> của bạn đã được thanh toán thành công.
        </p>

        <div className="success-info">
          <p>Chúng tôi sẽ xử lý đơn hàng và giao hàng trong thời gian sớm nhất.</p>
          <p>Bạn có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng của tôi".</p>
        </div>

        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate('/profile')}>
            Xem đơn hàng
          </button>
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

