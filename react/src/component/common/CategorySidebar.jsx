import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/categorySidebar.css';

const CategorySidebar = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { categoryId } = useParams();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await ApiService.getAllCategory();
            setCategories(response.categoryList || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Không thể tải danh mục');
        }
    };

    const handleCategoryClick = (catId) => {
        navigate(`/category/${catId}`);
    };

    const handleAllProductsClick = () => {
        navigate('/');
    };

    return (
        <div className="category-sidebar">
            <h3>Danh Mục Sản Phẩm</h3>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <ul>
                    <li>
                        <button 
                            className={!categoryId ? 'active' : ''}
                            onClick={handleAllProductsClick}
                        >
                            Tất Cả Sản Phẩm
                        </button>
                    </li>
                    {categories.map((category) => (
                        <li key={category.id}>
                            <button 
                                className={categoryId === category.id.toString() ? 'active' : ''}
                                onClick={() => handleCategoryClick(category.id)}
                            >
                                {category.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CategorySidebar;

