import React, { useState } from 'react';
import '../../style/navbar.css';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import ApiService from '../../service/ApiService';

const Navbar = () => {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = ApiService.isAdmin();
  const isAuthenticated = ApiService.isAuthenticated();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isProfileRoute = location.pathname.startsWith('/profile') || 
                         location.pathname.startsWith('/add-address') || 
                         location.pathname.startsWith('/edit-address');

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    navigate(`/?search=${searchValue}`);
  };

  const handleLogout = () => {
    const confirm = window.confirm('Bạn có chắc chắn muốn đăng xuất?');
    if (confirm) {
      ApiService.logout();
      setTimeout(() => {
        navigate('/login');
      }, 500);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to={isAdmin ? "/admin" : "/"}>
          <img src="/phegon_mart.png" alt="Phegon Mart" />
        </NavLink>
      </div>
      
      {/* SEARCH FORM - Chỉ hiện khi không phải trang admin hoặc profile của admin */}
      {!(isAdminRoute || (isProfileRoute && isAdmin)) && (
        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm"
            value={searchValue}
            onChange={handleSearchChange}
          />
          <button type="submit">Tìm kiếm</button>
        </form>
      )}

      <div className="navbar-link">
        {(isAdminRoute || isProfileRoute) && isAdmin ? (
          // Links gọn cho Admin khi ở trang admin hoặc profile
          <>
            <NavLink to="/profile">My Account</NavLink>
            <NavLink to="/admin">Admin</NavLink>
            <NavLink onClick={handleLogout}>Logout</NavLink>
          </>
        ) : (
          // Links đầy đủ cho user thường
          <>
            <NavLink to="/">Home</NavLink>
            {isAuthenticated && <NavLink to="/profile">My Account</NavLink>}
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
            {!isAuthenticated && <NavLink to="/login">Login</NavLink>}
            <NavLink to="/cart">Cart</NavLink>
            {isAuthenticated && <NavLink onClick={handleLogout}>Logout</NavLink>}
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
