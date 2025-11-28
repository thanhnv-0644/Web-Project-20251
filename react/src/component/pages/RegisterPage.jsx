import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/register.css'


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        name: '',
        phoneNumber: '',
        password: ''
    });

    const [message, setMessage] = useState(null);
    const navigate = useNavigate();


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.registerUser(formData);
            if (response.status === 200) {
                setMessage("User Successfully Registerd");
                setTimeout(() => {
                    navigate("/login")
                }, 4000)
            }
        } catch (error) {
            setMessage(error.response?.data.message || error.message || "unable to register a user");
        }
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h2>Đăng Ký Tài Khoản</h2>
                    <p>Tạo tài khoản mới để bắt đầu mua sắm</p>
                </div>
                
                {message && <p className="message">{message}</p>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nguyễn Văn A"
                            value={formData.name}
                            onChange={handleChange}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            name="phoneNumber"
                            placeholder="0123456789"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required />
                    </div>

                    <button type="submit" className="submit-button">Đăng Ký</button>
                    
                    <p className="register-link">
                        Đã có tài khoản? <a href="/login">Đăng nhập ngay</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage;