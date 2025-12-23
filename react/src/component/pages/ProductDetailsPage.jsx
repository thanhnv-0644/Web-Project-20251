import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import ApiService from "../../service/ApiService";
import "../../style/productDetailsPage.css";

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const { cart, dispatch } = useCart();

    const [user, setUser] = useState(null);

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);

    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");

    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(5);

    const isAdminReview = (review) => review.role === 0;
    const isOwner = (review) => {
    return user && review.user_id === user.id;
    };

    const isAdmin = user?.role === "ADMIN";

    
useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [productId]);


    /*  API */

    const fetchUser = async () => {
        try {
            const res = await ApiService.getLoggedInUserInfo();
            setUser(res.user);
        } catch {
            setUser(null);
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await ApiService.getProductById(productId);
            setProduct(res.product);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await ApiService.getReviewsByProduct(productId);
            setReviews(res.reviews || []);
            setAverageRating(res.averageRating || 0);
        } catch (err) {
            console.log(err);
        }
    };

    const submitReview = async () => {
        if (!content.trim()) {
            alert("Vui lòng nhập nội dung đánh giá");
            return;
        }

        try {
            await ApiService.addReview({ productId, rating, content });
            setContent("");
            setRating(5);
            fetchReviews();
        } catch {
            alert("Bạn cần đăng nhập để đánh giá");
        }
    };

    const deleteReview = async (reviewId) => {
        if (!window.confirm("Bạn có chắc muốn xoá đánh giá này?")) return;
        try {
            await ApiService.deleteReview(reviewId);
            fetchReviews();
        } catch {
            alert("Bạn không có quyền xoá đánh giá này");
        }
    };

    const startEdit = (review) => {
        setEditingReviewId(review.id);
        setEditContent(review.content);
        setEditRating(review.rating);
    };

    const submitEdit = async (reviewId) => {
        if (!editContent.trim()) {
            alert("Nội dung không được để trống");
            return;
        }

        try {
            await ApiService.updateReview(reviewId, {
                rating: editRating,
                content: editContent
            });
            setEditingReviewId(null);
            fetchReviews();
        } catch {
            alert("Bạn không có quyền chỉnh sửa đánh giá này");
        }
    };

    /* CART */

    const addToCart = () => {
        dispatch({ type: "ADD_ITEM", payload: product });
    };

    const incrementItem = () => {
        dispatch({ type: "INCREMENT_ITEM", payload: product });
    };

    const decrementItem = () => {
        const cartItem = cart.find(i => i.id === product.id);
        if (cartItem.quantity > 1) {
            dispatch({ type: "DECREMENT_ITEM", payload: product });
        } else {
            dispatch({ type: "REMOVE_ITEM", payload: product });
        }
    };

    if (!product) return <p>Đang tải thông tin sản phẩm...</p>;

    const cartItem = cart.find(i => i.id === product.id);

    /*UI */

    return (
        <div className="product-detail-page">

            {/* PRODUCT */}
            <div className="product-detail">
                <div className="product-image-section">
                    <img src={product.imageUrl} alt={product.name} />
                </div>

                <div className="product-info-section">
                    <h1>{product.name}</h1>
                    <p className="price">${product.price.toFixed(2)}</p>
                    <p>{product.description}</p>

                    {cartItem ? (
                        <div className="quantity-controls">
                            <button onClick={decrementItem}>-</button>
                            <span>{cartItem.quantity}</span>
                            <button onClick={incrementItem}>+</button>
                        </div>
                    ) : (
                        <button className="add-to-cart-btn" onClick={addToCart}>
                            Thêm vào giỏ
                        </button>
                    )}
                </div>
            </div>

            {/* REVIEWS */}
            <div className="review-section">
                <h2>Đánh giá sản phẩm</h2>

                <p className="average-rating">
                    ⭐ Trung bình: <strong>{averageRating.toFixed(1)}</strong> / 5
                </p>

                {/* ADD REVIEW */}
                {user && (
                    <div className="add-review">
                        <h3>Viết đánh giá</h3>

                        <div className="rating-input">
                            {[1,2,3,4,5].map(star => (
                                <span
                                    key={star}
                                    className={star <= rating ? "active" : ""}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>

                        <textarea
                            placeholder="Chia sẻ cảm nhận của bạn..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                        />

                        <button className="submit-review-btn" onClick={submitReview}>
                            Gửi đánh giá
                        </button>
                    </div>
                )}

                {/* REVIEW LIST */}
                <div className="review-list">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className={`review-item ${isAdminReview(review) ? "admin-review" : ""}`}
                        >
                            <div className="review-header">
                                <div className="review-username">
                                    {review.userName}
                                    {isAdminReview(review) && (
                                        <span className="admin-badge">ADMIN</span>
                                    )}
                                </div>

                                <div className="review-rating">
                                    {"★".repeat(review.rating)}
                                    {"☆".repeat(5 - review.rating)}
                                </div>
                            </div>

                            {editingReviewId === review.id ? (
                                <>
                                    <textarea
                                        value={editContent}
                                        onChange={e => setEditContent(e.target.value)}
                                    />
                                    <div className="review-actions">
                                        <button onClick={() => submitEdit(review.id)}>Lưu</button>
                                        <button onClick={() => setEditingReviewId(null)}>Huỷ</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="review-content">{review.content}</p>

                                    {(isOwner(review) || isAdmin) && (
                                        <div className="review-actions">

                                            {isOwner(review) && (
                                            <button
                                                className="edit-btn"
                                                onClick={() => startEdit(review)}
                                            >
                                            Sửa
                                            </button>
                                            )}

                                             <button
                                             className="delete-btn"
                                                onClick={() => deleteReview(review.id)}
                                            >
                                                Xoá
                                            </button>                       
                                             </div>
                                    )}

                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
