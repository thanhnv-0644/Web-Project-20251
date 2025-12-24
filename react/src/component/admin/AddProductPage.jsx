import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../../style/addProduct.css'
import ApiService from "../../service/ApiService";

const AddProductPage = () => {

    const [image, setImage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [price, setPrice] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        ApiService.getAllCategory().then((res) => setCategories(res.categoryList));
    }, [])

    const handleImage = (e) => {
        setImage(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('image', image);
            formData.append('categoryId', categoryId);
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price);

            const response = await ApiService.addProduct(formData);
            if (response.status === 200) {
                setMessage(response.message)
                setTimeout(() => {
                    setMessage('')
                    navigate('/admin/products')
                }, 3000);
            }

        } catch (error) {
            setMessage(error.response?.data?.message || error.message || 'Không thể tải lên sản phẩm')
        }
    }

    return(
        <div>
            <form onSubmit={handleSubmit} className="product-form">
                <h2>Thêm Sản Phẩm</h2>
                {message && <div className="message">{message}</div>}
                <input type="file" onChange={handleImage} />
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat)=>(
                        <option value={cat.id} key={cat.id}>{cat.name}</option>
                    ))}
                </select>
                <input type="text" 
                placeholder="Tên sản phẩm"
                value={name}
                onChange={(e)=> setName(e.target.value)} />

                <textarea 
                placeholder="Mô tả"
                value={description}
                onChange={(e)=> setDescription(e.target.value)}/>

                <input type="number" 
                placeholder="Giá"
                value={price}
                onChange={(e)=> setPrice(e.target.value)} />

                <button type="submit">Thêm Sản Phẩm</button>
            </form>
        </div>
    )

}
export default AddProductPage;