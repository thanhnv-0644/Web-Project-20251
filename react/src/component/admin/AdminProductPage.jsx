import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/adminProduct.css'
import Pagination from "../common/Pagination";
import ApiService from "../../service/ApiService";

const AdminProductPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [error, setError] = useState(null);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async() => {
        try {
            const response = await ApiService.getAllCategory();
            setCategories(response.categoryList || []);
        } catch (error) {
            console.error('Không thể tải danh sách danh mục:', error);
        }
    }

    const fetchProducts = async() => {
        try {
            let response;
            if (selectedCategory) {
                response = await ApiService.getAllProductsByCategoryId(selectedCategory);
            } else {
                response = await ApiService.getAllProducts();
            }
            const productList = response.productList || [];
            setTotalPages(Math.ceil(productList.length/itemsPerPage));
            setProducts(productList.slice((currentPage -1) * itemsPerPage, currentPage * itemsPerPage));
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Không thể tải danh sách sản phẩm')
            
        }
    }

    useEffect(()=>{
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, selectedCategory]);

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setCurrentPage(1); // Reset về trang 1 khi đổi category
    }

    const handleEdit = async (id) => {
        navigate(`/admin/edit-product/${id}`)
    }
    const handleDelete = async(id) => {
        const confirmed = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")
        if(confirmed){
            try {
                await ApiService.deleteProduct(id);
                fetchProducts();
            } catch (error) {
                setError(error.response?.data?.message || error.message || 'Không thể xóa sản phẩm')
            }
        }
    }

    return(
        <div className="admin-product-list">
            {error ? (
                <p className="error-message">{error}</p>
            ): (
                <div>
                    <h2>Sản Phẩm</h2>
                    <div className="product-actions">
                        <button className="product-btn" onClick={()=> {navigate('/admin/add-product'); }}>Thêm sản phẩm</button>
                        <div className="category-filter">
                            <label htmlFor="category-select">Lọc theo danh mục:</label>
                            <select 
                                id="category-select"
                                value={selectedCategory} 
                                onChange={handleCategoryChange}
                                className="category-select"
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <ul>
                        {products.length > 0 ? (
                            products.map((product)=>(
                                <li key={product.id}>
                                    <span>{product.name}</span>
                                    <button className="product-btn" onClick={()=> handleEdit(product.id)}>Sửa</button>
                                    <button className="product-btn-delete" onClick={()=> handleDelete(product.id)}>Xóa</button>
                                </li>
                            ))
                        ) : (
                            <p className="no-products">Không có sản phẩm nào trong danh mục này</p>
                        )}
                    </ul>
                    <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page)=> setCurrentPage(page)}/>
                </div>
            )}
        </div>
    )
}
export default AdminProductPage;