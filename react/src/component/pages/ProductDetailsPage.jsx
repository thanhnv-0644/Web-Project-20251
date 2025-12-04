import React, {useEffect, useState} from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';


const ProductDetailsPage = () => {

    const {productId} = useParams();
    const {cart, dispatch} = useCart();
    const [product, setProduct] = useState(null);

    useEffect(()=>{
        fetchProduct();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId])

    const fetchProduct = async () => {
        try {
            const response = await ApiService.getProductById(productId);
            setProduct(response.product);
            
        } catch (error) {
            console.log(error.message || error)
        }
    }

    
    const addToCart = () => {
        if (product) {
            dispatch({type: 'ADD_ITEM', payload: product});   
        }
    }

    const incrementItem = () => {
        if(product){
            dispatch({type: 'INCREMENT_ITEM', payload: product});
 
        }
    }

    const decrementItem = () => {
        if (product) {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem && cartItem.quantity > 1) {
                dispatch({type: 'DECREMENT_ITEM', payload: product}); 
            }else{
                dispatch({type: 'REMOVE_ITEM', payload: product}); 
            }
            
        }
    }

    if (!product) {
        return (
            <div className="loading-container">
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        )
    }

    const cartItem = cart.find(item => item.id === product.id);

    return(
        <div className="product-detail-page">
            <div className="product-detail">
                <div className="product-image-section">
                    <img src={product?.imageUrl} alt={product?.name} />
                </div>
                
                <div className="product-info-section">
                    <h1>{product?.name}</h1>
                    
                    <div className="product-price">
                        <span className="price-label">Giá:</span>
                        <span className="price-value">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="product-description">
                        <h3>Mô tả sản phẩm</h3>
                        <p>{product?.description}</p>
                    </div>
                    
                    <div className="product-actions">
                        {cartItem ? (
                            <div className="cart-controls">
                                <span className="controls-label">Số lượng trong giỏ:</span>
                                <div className="quantity-controls">
                                    <button onClick={decrementItem}>-</button>
                                    <span>{cartItem.quantity}</span>
                                    <button onClick={incrementItem}>+</button>
                                </div>
                            </div>
                        ):(
                            <button className="add-to-cart-btn" onClick={addToCart}>
                                Thêm Vào Giỏ Hàng
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ProductDetailsPage;