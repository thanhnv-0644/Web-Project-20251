import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/address.css';

const AddressPage = () => {

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
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
            setError(error.response?.data?.message || error.message || "unable to fetch user information")
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
            setError(error.response?.data?.message || error.message || "Failed to save/update address")
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
                        <label>Địa chỉ đường</label>
                        <input 
                            type="text"
                            name="street"
                            placeholder="Số nhà, tên đường"
                            value={address.street}
                            onChange={handleChange}
                            required/>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Thành phố</label>
                            <input 
                                type="text"
                                name="city"
                                placeholder="Hà Nội, TP.HCM, ..."
                                value={address.city}
                                onChange={handleChange}
                                required/>
                        </div>
                        
                        <div className="form-group">
                            <label>Tỉnh/Bang</label>
                            <input 
                                type="text"
                                name="state"
                                placeholder="Tỉnh/Bang"
                                value={address.state}
                                onChange={handleChange}
                                required/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Mã bưu điện</label>
                            <input 
                                type="text"
                                name="zipCode"
                                placeholder="100000"
                                value={address.zipCode}
                                onChange={handleChange}
                                required/>
                        </div>

                        <div className="form-group">
                            <label>Quốc gia</label>
                            <input 
                                type="text"
                                name="country"
                                placeholder="Việt Nam"
                                value={address.country}
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