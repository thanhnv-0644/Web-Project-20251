import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/address.css';

const AddressPage = () => {

    const [address, setAddress] = useState({
        street: '', // Địa chỉ cụ thể
        ward: '',   // Phường
        city: ''    // Thành phố
    });

    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {

        if (location.pathname === '/edit-address') {
            fetchUserInfo();
        }
    }, [location.pathname]);


    const fetchUserInfo = async()=>{
        try {
            const response = await ApiService.getLoggedInUserInfo();
            if (response.user.address) {
                setAddress(response.user.address)
            }
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Không thể tải thông tin người dùng")
        }
    } ;

    const handleChange = (e) =>{
        const {name, value} = e.target;
        setAddress((prevAddress) => ({
            ...prevAddress,
            [name]: value
        }))
    }

    const handSubmit = async (e) =>{
        e.preventDefault();
        try {
            await ApiService.saveAddress(address);
            navigate("/profile")
        } catch (error) {
            setError(error.response?.data?.message || error.message || "Không thể lưu/cập nhật địa chỉ")
        }
    }


    return(
        <div className="address-page">
            <div className="address-container">
                <div className="address-header">
                    <h2>{location.pathname === '/edit-address' ? 'Chỉnh Sửa Địa Chỉ' : "Thêm Địa Chỉ Mới"}</h2>
                    <p>Vui lòng nhập thông tin địa chỉ giao hàng của bạn</p>
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <form onSubmit={handSubmit}>
                    <div className="form-group">
                        <label>Địa chỉ cụ thể *</label>
                        <input 
                            type="text"
                            name="street"
                            placeholder="Ví dụ: Số 123, Đường Nguyễn Trãi"
                            value={address.street}
                            onChange={handleChange}
                            required/>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Phường/Xã *</label>
                            <input 
                                type="text"
                                name="ward"
                                placeholder="Ví dụ: Phường Bến Thành"
                                value={address.ward}
                                onChange={handleChange}
                                required/>
                        </div>
                        
                        <div className="form-group">
                            <label>Thành phố *</label>
                            <input 
                                type="text"
                                name="city"
                                placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh"
                                value={address.city}
                                onChange={handleChange}
                                required/>
                        </div>
                    </div>
                    
                    <button type="submit" className="submit-button">
                        {location.pathname === '/edit-address' ? 'Cập Nhật Địa Chỉ' : "Lưu Địa Chỉ"}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AddressPage;