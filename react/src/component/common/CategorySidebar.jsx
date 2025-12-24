import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ApiService from "../../service/ApiService";
import '../../style/categorySidebar.css';

const CategorySidebar = () => {
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
    };

    const handleAllProductsClick = () => {
        navigate('/');
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Tìm tên category hiện tại
    const currentCategory = categories.find(cat => cat.id.toString() === categoryId);
    const displayText = currentCategory ? currentCategory.name : 'Tất Cả Sản Phẩm';

    return (
        <div className="category-sidebar">
            <h3>Danh Mục Sản Phẩm</h3>
            {error ? (
                <p className="error-message">{error}</p>
            ) : (
                <div className="category-dropdown">
                    <button 
                        className={`dropdown-toggle ${isOpen ? 'open' : ''}`}
                        onClick={toggleDropdown}
                    >
                        <span>{displayText}</span>
                        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    
                    {isOpen && (
                        <ul className="dropdown-menu">
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
            )}
        </div>
    );
};

export default CategorySidebar;

