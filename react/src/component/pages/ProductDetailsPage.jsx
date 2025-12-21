import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import '../../style/productDetailsPage.css';


const ProductDetailsPage = () => {

    const { productId } = useParams();
    const { cart, dispatch } = useCart();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");

    useEffect(() => {
        fetchProduct();
        fetchReviews();
        // eslint-disable-next-line
    }, [productId]);

    const fetchProduct = async () => {
        try {
            const response = await ApiService.getProductById(productId);
            setProduct(response.product);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchReviews = async () => {
        try {
            const response = await ApiService.getReviewsByProduct(productId);
            setReviews(response.reviews || []);
            setAverageRating(response.averageRating || 0);
        } catch (error) {
            console.log(error);
        }
    };

    const addToCart = () => {
        if (product) {
            dispatch({ type: "ADD_ITEM", payload: product });
        }
    };

    const incrementItem = () => {
        dispatch({ type: "INCREMENT_ITEM", payload: product });
    };

    const decrementItem = () => {
        const cartItem = cart.find(item => item.id === product.id);
        if (cartItem.quantity > 1) {
            dispatch({ type: "DECREMENT_ITEM", payload: product });
        } else {
            dispatch({ type: "REMOVE_ITEM", payload: product });
        }
    };

    const submitReview = async () => {
        if (!content.trim()) {
            alert("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            await ApiService.addReview({
                productId,
                rating,
                content
            });
            setContent("");
            setRating(5);
            fetchReviews();
        } catch (error) {
            alert("Bạn cần đăng nhập để đánh giá");
        }
    };

    if (!product) {
        return <p>Đang tải thông tin sản phẩm...</p>;
    }

    const cartItem = cart.find(item => item.id === product.id);

    return (
        <div className="product-detail-page">
            <div className="product-detail">

                <div className="product-image-section">
                    <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="product-info-section">
                    <h1>{product.name}</h1>

                    <p className="price">
                        ${product.price.toFixed(2)}
                    </p>

                    <p>{product.description}</p>

                    {cartItem ? (
                        <div className="quantity-controls">
                            <button onClick={decrementItem}>-</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={incrementItem}>+</button>
                        </div>
                    ) : (
                        <button  className="add-to-cart-btn" onClick={addToCart}>Thêm vào giỏ</button>
                    )}
                </div>
            </div>

            {/* ===== REVIEW SECTION ===== */}
            <div className="review-section">
                <h2>Đánh giá sản phẩm</h2>

                <p>⭐ Trung bình: {averageRating.toFixed(1)} / 5</p>

                {/* ADD REVIEW */}
                <div className="add-review">
                    <h3>Viết đánh giá</h3>

                    <select value={rating} onChange={e => setRating(+e.target.value)}>
                        {[5,4,3,2,1].map(r => (
                            <option key={r} value={r}>{r} ⭐</option>
                        ))}
                    </select>

                    <textarea
                        placeholder="Nhập đánh giá của bạn..."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />

                    <button type="button" onClick={submitReview}>Gửi đánh giá</button>
                </div>

                {/* REVIEW LIST */}
                <div className="review-list">
                    {reviews.length === 0 && <p>Chưa có đánh giá nào</p>}

                    {reviews.map(review => (
                        <div key={review.id} className="review-item">
                            <strong>{review.userName}</strong>
                            <span>⭐ {review.rating}</span>
                            <p>{review.content}</p>
                            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
