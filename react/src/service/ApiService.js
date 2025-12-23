import axios from 'axios';

export default class ApiService {
  static BASE_URL = process.env.REACT_APP_API_URL || '';

  static getHeader() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**AUTh && USERS API */
  static async registerUser(registration) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registration
    );
    return response.data;
  }

  static async loginUser(loginDetails) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/login`,
      loginDetails
    );
    return response.data;
  }

  static async getLoggedInUserInfo() {
    const response = await axios.get(`${this.BASE_URL}/user/my-info`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateUserProfile(updateData) {
    const response = await axios.patch(
      `${this.BASE_URL}/user/update-profile`,
      updateData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**PRODUCT ENDPOINT */

  static async addProduct(formData) {
    const response = await axios.post(
      `${this.BASE_URL}/product/create`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  static async updateProduct(formData) {
    const response = await axios.put(
      `${this.BASE_URL}/product/update`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  static async getAllProducts() {
    const response = await axios.get(`${this.BASE_URL}/product/get-all`);
    return response.data;
  }

  static async searchProducts(searchValue) {
    const response = await axios.get(`${this.BASE_URL}/product/search`, {
      params: { searchValue },
    });
    return response.data;
  }

  static async getAllProductsByCategoryId(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/product/get-by-category-id/${categoryId}`
    );
    return response.data;
  }

  static async getProductById(productId) {
    const response = await axios.get(
      `${this.BASE_URL}/product/get-by-product-id/${productId}`
    );
    return response.data;
  }

  static async deleteProduct(productId) {
    const response = await axios.delete(
      `${this.BASE_URL}/product/delete/${productId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**CATEGORY */
  static async createCategory(body) {
    const response = await axios.post(
      `${this.BASE_URL}/category/create`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllCategory() {
    const response = await axios.get(`${this.BASE_URL}/category/get-all`);
    return response.data;
  }

  static async getCategoryById(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/category/get-category-by-id/${categoryId}`
    );
    return response.data;
  }

  static async updateCategory(categoryId, body) {
    const response = await axios.put(
      `${this.BASE_URL}/category/update/${categoryId}`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteCategory(categoryId) {
    const response = await axios.delete(
      `${this.BASE_URL}/category/delete/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**ORDEDR */
  static async createOrder(body) {
    const response = await axios.post(`${this.BASE_URL}/order/create`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getAllOrders() {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getOrderItemById(itemId) {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
      params: { itemId },
    });
    return response.data;
  }

  static async getAllOrderItemsByStatus(status) {
    const response = await axios.get(`${this.BASE_URL}/order/filter`, {
      headers: this.getHeader(),
      params: { status },
    });
    return response.data;
  }

  static async updateOrderitemStatus(orderItemId, status) {
    const response = await axios.put(
      `${this.BASE_URL}/order/update-item-status/${orderItemId}`,
      {},
      {
        headers: this.getHeader(),
        params: { status },
      }
    );
    return response.data;
  }

  /** NEW ORDER APIs (Order-based, not OrderItem-based) */
  static async getAllOrdersNew() {
    const response = await axios.get(`${this.BASE_URL}/api/orders/all`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getMyOrders() {
    const response = await axios.get(`${this.BASE_URL}/api/orders/my-orders`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getOrderByIdNew(orderId) {
    const response = await axios.get(`${this.BASE_URL}/api/orders/${orderId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateOrderStatus(orderId, status) {
    const response = await axios.put(
      `${this.BASE_URL}/api/orders/${orderId}/status`,
      {},
      {
        headers: this.getHeader(),
        params: { status },
      }
    );
    return response.data;
  }

  static async getOrdersByStatus(status) {
    const response = await axios.get(`${this.BASE_URL}/api/orders/status/${status}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async confirmDelivered(orderId) {
    const response = await axios.put(
      `${this.BASE_URL}/api/orders/${orderId}/confirm-delivered`,
      {},
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /**ADDRESS */
  static async saveAddress(body) {
    const response = await axios.post(`${this.BASE_URL}/address/save`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  /***AUTHEMNTICATION CHECKER */
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }

  static isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  static isAdmin() {
    const role = localStorage.getItem('role');
    return role === 'ADMIN';
  }
  /** DASHBOARD API */
  static async getDashboardSummary() {
    const res = await axios.get(
      `${this.BASE_URL}/api/admin/dashboard/summary`,
      { headers: this.getHeader() }
    );
    return res.data;
  }

  static async getRevenueByMonth() {
    const res = await axios.get(
      `${this.BASE_URL}/api/admin/dashboard/revenue-by-month`,
      { headers: this.getHeader() }
    );
    return res.data;
  }

  static async getTopProducts(limit = 5) {
    const res = await axios.get(
      `${this.BASE_URL}/api/admin/dashboard/top-products`,
      {
        headers: this.getHeader(),
        params: { limit },
      }
    );
    return res.data;
  }

  static async getUserGrowth() {
    const res = await axios.get(
      `${this.BASE_URL}/api/admin/dashboard/user-growth`,
      { headers: this.getHeader() }
    );
    return res.data;
  }
  static async get(url) {
    const response = await axios.get(`${this.BASE_URL}${url}`, {
      headers: this.getHeader(),
    });
    return response;
  }

  /** REVIEW API */
  static async post(url, data) {
    const response = await axios.post(`${this.BASE_URL}${url}`, data, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async getReviewsByProduct(productId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/reviews/product/${productId}`
    );
    return response.data;
  }

  static async addReview(body) {
    const response = await axios.post(`${this.BASE_URL}/api/reviews`, body, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async updateReview(reviewId, body) {
    const response = await axios.put(
      `${this.BASE_URL}/api/reviews/${reviewId}`,
      body,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }
  /** REVIEW API - DELETE */
  static async deleteReview(reviewId) {
    const response = await axios.delete(
      `${this.BASE_URL}/api/reviews/${reviewId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  /** PAYMENT API */
  // Tạo payment cho order
  static async createPaymentForOrder(orderId, expirationMinutes = 15) {
    const response = await axios.post(
      `${this.BASE_URL}/api/payments/create-for-order/${orderId}`,
      { method: 'VIETQR', expirationMinutes },
      { headers: this.getHeader() }
    );
    return response.data;
  }

  // Lấy payment theo orderId
  static async getPaymentByOrder(orderId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/payments/by-order/${orderId}`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  // Lấy payment theo paymentId
  static async getPaymentById(paymentId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/payments/${paymentId}`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  // Kiểm tra trạng thái payment
  static async checkPaymentStatus(paymentId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/payments/${paymentId}/status`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  // Upload minh chứng thanh toán
  static async uploadPaymentProof(paymentId, file, note, userId) {
    const formData = new FormData();
    formData.append('file', file);
    if (note) formData.append('note', note);

    const response = await axios.post(
      `${this.BASE_URL}/api/payments/${paymentId}/proof`,
      formData,
      {
        headers: {
          ...this.getHeader(),
          'Content-Type': 'multipart/form-data',
          'X-USER-ID': userId,
        },
      }
    );
    return response.data;
  }

  // Lấy danh sách minh chứng
  static async getPaymentProofs(paymentId, userId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/payments/${paymentId}/proofs`,
      {
        headers: {
          ...this.getHeader(),
          'X-USER-ID': userId,
        },
      }
    );
    return response.data;
  }

  // Lấy minh chứng mới nhất
  static async getLatestPaymentProof(paymentId, userId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/payments/${paymentId}/proof/latest`,
      {
        headers: {
          ...this.getHeader(),
          'X-USER-ID': userId,
        },
      }
    );
    return response.data;
  }

  /** ADMIN PAYMENT API */
  // Lấy danh sách payments chờ duyệt
  static async getPaymentsAwaitingConfirmation() {
    const response = await axios.get(
      `${this.BASE_URL}/api/admin/payments/awaiting-confirmation`,
      { headers: this.getHeader() }
    );
    return response.data;
  }

  // Lấy chi tiết payment (admin)
  static async getPaymentDetailAdmin(paymentId, adminId) {
    const response = await axios.get(
      `${this.BASE_URL}/api/admin/payments/${paymentId}`,
      {
        headers: {
          ...this.getHeader(),
          'X-ADMIN-ID': adminId,
        },
      }
    );
    return response.data;
  }

  // Duyệt thanh toán
  static async approvePayment(paymentId, adminId) {
    const response = await axios.post(
      `${this.BASE_URL}/api/admin/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          ...this.getHeader(),
          'X-ADMIN-ID': adminId,
        },
      }
    );
    return response.data;
  }

  // Từ chối thanh toán
  static async rejectPayment(paymentId, adminId, reason) {
    const response = await axios.post(
      `${this.BASE_URL}/api/admin/payments/${paymentId}/reject`,
      { reason },
      {
        headers: {
          ...this.getHeader(),
          'X-ADMIN-ID': adminId,
        },
      }
    );
    return response.data;
  }
}
