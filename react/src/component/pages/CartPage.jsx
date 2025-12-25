import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import { useCart } from '../context/CartContext';
import '../../style/cart.css';

const CartPage = () => {
  const { cart, dispatch } = useCart();
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra xem có pending order đã được thanh toán chưa
  useEffect(() => {
    const checkPendingOrder = async () => {
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      if (pendingOrderId) {
        try {
          // Kiểm tra payment status của order
          const paymentResponse = await ApiService.getPaymentByOrder(
            pendingOrderId
          );

          if (paymentResponse.success) {
            const paymentStatus = paymentResponse.data.payment.status;

            // Nếu đã PAID, clear cart
            if (paymentStatus === 'PAID') {
              dispatch({ type: 'CLEAR_CART' });
              localStorage.removeItem('pendingOrderId');
              localStorage.removeItem('pendingCart');
              setMessage('Đơn hàng của bạn đã được thanh toán thành công!');
              setTimeout(() => setMessage(''), 3000);
            }
          }
        } catch (err) {
          // Nếu không tìm thấy payment, có thể order chưa có payment
          console.log('No payment found for pending order');
        }
      }
    };

    checkPendingOrder();
  }, [dispatch]);

  const incrementItem = (product) => {
    dispatch({ type: 'INCREMENT_ITEM', payload: product });
  };

  const decrementItem = (product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    if (cartItem && cartItem.quantity > 1) {
      dispatch({ type: 'DECREMENT_ITEM', payload: product });
    } else {
      dispatch({ type: 'REMOVE_ITEM', payload: product });
    }
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!ApiService.isAuthenticated()) {
      setMessage('Bạn cần đăng nhập trước khi đặt hàng');
      setTimeout(() => {
        setMessage('');
        navigate('/login');
      }, 3000);
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
    }));

    const orderRequest = {
      totalPrice,
      items: orderItems,
    };

    try {
      const response = await ApiService.createOrder(orderRequest);
      console.log('Create Order Response:', response); // Debug log
      setMessage(response.message);

      if (response.status === 200) {
        // Lưu orderId vào localStorage để clear cart sau khi thanh toán thành công
        const orderId = response.orderId || response.data?.orderId;
        console.log('OrderId:', orderId); // Debug log

        if (orderId) {
          // Lưu cart items để có thể restore nếu cần
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(cart));

          console.log('Navigating to:', `/payment/${orderId}`); // Debug log
          setTimeout(() => {
            navigate(`/payment/${orderId}`);
          }, 500);
        } else {
          console.error('No orderId in response:', response); // Debug log
          setMessage('Không thể lấy orderId. Vui lòng thử lại.');
        }
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || error.message || 'Không thể đặt hàng'
      );
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Giỏ Hàng Của Bạn</h2>
        {message && <p className="response-message">{message}</p>}

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Giỏ hàng của bạn đang trống</p>
            <button onClick={() => navigate('/')}>Tiếp Tục Mua Sắm</button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button onClick={() => decrementItem(item)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => incrementItem(item)}>+</button>
                      </div>
                      <span className="price">
                        {item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Tóm Tắt Đơn Hàng</h3>
              <div className="summary-row">
                <span>Tạm tính:</span>
                <span>{totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>Tổng cộng:</span>
                <span>{totalPrice}</span>
              </div>
              <button className="checkout-button" onClick={handleCheckout}>
                Thanh Toán
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
