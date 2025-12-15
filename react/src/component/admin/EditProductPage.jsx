import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../style/addProduct.css';
import ApiService from '../../service/ApiService';

const EditProductPage = () => {
  const { productId } = useParams();
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.getAllCategory().then((res) => setCategories(res.categoryList));

    if (productId) {
      ApiService.getProductById(productId).then((response) => {
        setName(response.product.name);
        setDescription(response.product.description);
        setPrice(response.product.price);
        setCategoryId(response.product.categoryId);
        setImageUrl(response.product.imageUrl);
      });
    }
  }, [productId]);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // Always append productId
      formData.append('productId', productId);

      // Only append image if a new one is selected
      if (image) {
        formData.append('image', image);
      }

      // Only append fields that have values
      if (categoryId && categoryId !== '') {
        formData.append('categoryId', categoryId);
      }
      if (name && name.trim() !== '') {
        formData.append('name', name);
      }
      if (description && description.trim() !== '') {
        formData.append('description', description);
      }
      if (price && price !== '') {
        formData.append('price', price);
      }

      const response = await ApiService.updateProduct(formData);
      if (response.status === 200) {
        setMessage(response.message);
        setTimeout(() => {
          setMessage('');
          navigate('/admin/products');
        }, 3000);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          error.message ||
          'unable to update product'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-form">
      <h2>Edit Product</h2>
      {message && <div className="message">{message}</div>}
      <input type="file" onChange={handleImageChange} />
      {imageUrl && <img src={imageUrl} alt={name} />}
      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        required
      >
        <option value="">Select Category</option>
        {categories.map((cat) => (
          <option value={cat.id} key={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        step="0.01"
        min="0"
        required
      />

      <button type="submit">Update</button>
    </form>
  );
};

export default EditProductPage;
