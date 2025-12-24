import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import { useNavigate, useParams } from "react-router-dom";
import '../../style/addCategory.css'

const EditCategory = () => {
    const { categoryId } = useParams();
    const [name, setName] = useState('')
    const [message, setMessage] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchCategory(categoryId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoryId])

    const fetchCategory = async () => {
        try {
            const response = await ApiService.getCategoryById(categoryId);
            setName(response.category.name);

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Không thể lấy danh mục theo id")
            setTimeout(() => {
                setMessage('');
            }, 3000)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await ApiService.updateCategory(categoryId, { name });
            if (response.status === 200) {
                setMessage(response.message);
                setTimeout(() => {
                    setMessage('');
                    navigate("/admin/categories")
                }, 3000)
            }
        } catch (error) {
            setMessage(error.response?.data?.message || error.message || "Không thể lưu danh mục")
        }
    }

    return (
        <div className="add-category-page">
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit} className="category-form">
                <h2>Sửa Danh Mục</h2>
                <input type="text"
                    placeholder="Tên danh mục"
                    value={name}
                    onChange={(e) => setName(e.target.value)} />

                <button type="submit">Cập Nhật</button>
            </form>
        </div>
    )

}

export default EditCategory;