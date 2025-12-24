import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../style/adminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-page">
      <h1>Chào mừng Admin</h1>
      <button onClick={() => navigate('/admin/dashboard')}>
        Xem Dashboard
      </button>
      <button onClick={() => navigate('/admin/categories')}>
        Quản Lý Danh Mục
      </button>
      <button onClick={() => navigate('/admin/products')}>
        Quản Lý Sản Phẩm
      </button>
      <button onClick={() => navigate('/admin/orders')}>
        Quản Lý Đơn Hàng
      </button>
      <button onClick={() => navigate('/admin/payments')}>
        Quản Lý Thanh Toán
      </button>
    </div>
  );
};

export default AdminPage;
