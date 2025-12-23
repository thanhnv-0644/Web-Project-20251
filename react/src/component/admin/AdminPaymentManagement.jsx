import React, { useState, useEffect } from 'react';
import ApiService from '../../service/ApiService';
import '../../style/adminPayment.css';

const AdminPaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Lấy adminId từ localStorage
  const adminId = localStorage.getItem('userId') || '1';

  useEffect(() => {
    fetchPayments();
    // Auto refresh mỗi 30 giây
    const interval = setInterval(fetchPayments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPaymentsAwaitingConfirmation();
      setPayments(response);
      setError('');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Không thể tải danh sách thanh toán'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (payment) => {
    try {
      const response = await ApiService.getPaymentDetailAdmin(
        payment.id,
        adminId
      );
      setSelectedPayment(response);
      setShowDetailModal(true);
    } catch (err) {
      alert('Không thể tải chi tiết thanh toán');
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Xác nhận duyệt thanh toán này?')) return;

    try {
      const response = await ApiService.approvePayment(paymentId, adminId);
      if (response.success) {
        alert('Đã duyệt thanh toán thành công!');
        fetchPayments();
        setShowDetailModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Duyệt thanh toán thất bại');
    }
  };

  const handleReject = async (paymentId) => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    try {
      const response = await ApiService.rejectPayment(
        paymentId,
        adminId,
        reason
      );
      if (response.success) {
        alert('Đã từ chối thanh toán!');
        fetchPayments();
        setShowDetailModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Từ chối thanh toán thất bại');
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="admin-payment-page">
        <div className="loading">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="admin-payment-page">
      <div className="page-header">
        <h1>Quản lý thanh toán</h1>
        <button className="btn-refresh" onClick={fetchPayments}>
          🔄 Làm mới
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {payments.length === 0 ? (
        <div className="empty-state">
          <p>Không có thanh toán nào chờ duyệt</p>
        </div>
      ) : (
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Số tiền</th>
                <th>Nội dung CK</th>
                <th>Thời gian tạo</th>
                <th>Minh chứng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>#{payment.orderId}</td>
                  <td className="amount">
                    {payment.amount?.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td>
                    <code>{payment.transferContent}</code>
                  </td>
                  <td>{formatDateTime(payment.createdAt)}</td>
                  <td>
                    {payment.latestProof ? (
                      <span className="badge badge-success">Có</span>
                    ) : (
                      <span className="badge badge-warning">Chưa có</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetail(payment)}
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment.payment}
          proofs={selectedPayment.proofs}
          onClose={() => setShowDetailModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

// Component Modal chi tiết payment
const PaymentDetailModal = ({
  payment,
  proofs,
  onClose,
  onApprove,
  onReject,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chi tiết thanh toán #{payment.id}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Payment Info */}
          <div className="info-section">
            <h3>Thông tin thanh toán</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Order ID:</span>
                <span className="value">#{payment.orderId}</span>
              </div>
              <div className="info-item">
                <span className="label">Số tiền:</span>
                <span className="value amount">
                  {payment.amount?.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="info-item">
                <span className="label">Phương thức:</span>
                <span className="value">{payment.method}</span>
              </div>
              <div className="info-item">
                <span className="label">Nội dung CK:</span>
                <span className="value">
                  <code>{payment.transferContent}</code>
                </span>
              </div>
              <div className="info-item">
                <span className="label">Trạng thái:</span>
                <span
                  className={`badge badge-${payment.status?.toLowerCase()}`}
                >
                  {payment.status}
                </span>
              </div>
              <div className="info-item">
                <span className="label">Thời gian tạo:</span>
                <span className="value">
                  {formatDateTime(payment.createdAt)}
                </span>
              </div>
              {payment.expiredAt && (
                <div className="info-item">
                  <span className="label">Hết hạn:</span>
                  <span className="value">
                    {formatDateTime(payment.expiredAt)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Proofs */}
          <div className="proofs-section">
            <h3>Minh chứng thanh toán ({proofs?.length || 0})</h3>
            {proofs && proofs.length > 0 ? (
              <div className="proofs-grid">
                {proofs.map((proof) => (
                  <div key={proof.id} className="proof-card">
                    <div className="proof-image">
                      <img src={proof.imageUrl} alt="Minh chứng" />
                    </div>
                    <div className="proof-info">
                      <p className="proof-status">
                        <span
                          className={`badge badge-${proof.status?.toLowerCase()}`}
                        >
                          {proof.status}
                        </span>
                      </p>
                      {proof.note && (
                        <p className="proof-note">
                          <strong>Ghi chú:</strong> {proof.note}
                        </p>
                      )}
                      <p className="proof-time">
                        {formatDateTime(proof.uploadedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-proofs">Chưa có minh chứng nào</p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Đóng
          </button>
          <button className="btn-reject" onClick={() => onReject(payment.id)}>
            ❌ Từ chối
          </button>
          <button className="btn-approve" onClick={() => onApprove(payment.id)}>
            ✅ Duyệt thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function
const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

export default AdminPaymentManagement;
