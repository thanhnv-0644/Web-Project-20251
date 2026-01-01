import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../service/ApiService';
import '../../style/payment.css';

const PaymentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [bankInfo, setBankInfo] = useState({});
  const [error, setError] = useState('');
  const [showUploadProof, setShowUploadProof] = useState(false);

  // Lấy userId từ localStorage (hoặc từ context)
  const userId = localStorage.getItem('userId') || '1';

  useEffect(() => {
    fetchPaymentInfo();
    // Polling để check payment status mỗi 5 giây
    const interval = setInterval(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchPaymentInfo = async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      console.log('Fetching payment for orderId:', orderId);

      const response = await ApiService.createPaymentForOrder(orderId, 15);
      console.log('Payment response:', response);

      if (response.success) {
        const paymentData = response.data.payment;
        const qrUrl = response.data.qrCodeUrl;
        const bank = response.data.bankInfo;

        setPayment(paymentData);
        setQrCodeUrl(qrUrl);
        setBankInfo(bank);

        console.log('Payment data:', paymentData);
        console.log('QR Code URL:', qrUrl);
        console.log('Bank info:', bank);
      } else {
        setError(response.message || 'Không thể tạo thanh toán');
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Không thể tạo thanh toán';
      setError(errorMsg);

      // Nếu lỗi duplicate, có thể order đã có payment rồi, thử lấy payment hiện tại
      if (
        errorMsg.includes('Duplicate') ||
        errorMsg.includes('đã được thanh toán')
      ) {
        try {
          const existingPayment = await ApiService.getPaymentByOrder(orderId);
          if (existingPayment.success) {
            setPayment(existingPayment.data.payment);
            setQrCodeUrl(existingPayment.data.qrCodeUrl);
            setBankInfo(existingPayment.data.bankInfo);
            setError(''); // Clear error
          }
        } catch (retryErr) {
          console.error('Retry error:', retryErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!payment) return;

    try {
      const response = await ApiService.checkPaymentStatus(payment.id);
      if (response.success && response.status === 'PAID') {
        // Thanh toán thành công, chuyển đến trang success
        navigate(`/payment-success/${orderId}`);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    }
  };

  const handleUploadProof = () => {
    setShowUploadProof(true);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy!');
  };

  const handleBackToCart = () => {
    // Restore cart nếu có
    const pendingCart = localStorage.getItem('pendingCart');
    if (pendingCart) {
      // Không cần restore vì cart vẫn còn (chưa bị clear)
    }
    navigate('/cart');
  };

  const handleRetryPayment = async () => {
    try {
      setLoading(true);
      setError('');

      // ONE-TO-ONE: Refresh payment hiện tại (không tạo mới)
      // Backend sẽ trả về payment hiện tại với message yêu cầu upload proof mới
      const response = await ApiService.createPaymentForOrder(orderId, 15);

      if (response.success) {
        const paymentData = response.data.payment;
        const qrUrl = response.data.qrCodeUrl;
        const bank = response.data.bankInfo;

        setPayment(paymentData);
        setQrCodeUrl(qrUrl);
        setBankInfo(bank);

        alert('Vui lòng upload minh chứng thanh toán mới!');
      } else {
        setError(response.message || 'Không thể làm mới thanh toán');
      }
    } catch (err) {
      console.error('Retry payment error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Không thể làm mới thanh toán';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-page">
        <div className="loading">Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="payment-page">
        <div className="payment-container">
          <div className="error-message">{error}</div>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={handleBackToCart}>
              ← Quay lại giỏ hàng
            </button>
            <button className="btn-primary" onClick={fetchPaymentInfo}>
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-container">
        <h1>Thanh toán đơn hàng #{orderId}</h1>

        <div className="payment-status-badge status-{payment?.status?.toLowerCase()}">
          {getStatusText(payment?.status)}
        </div>

        {/* Thông báo từ chối thanh toán */}
        {payment?.status === 'REJECTED' && (
          <div className="rejection-box">
            <div className="rejection-icon">❌</div>
            <div className="rejection-content">
              <h3>Thanh toán của bạn đã bị từ chối</h3>
              {payment?.rejectionReason && (
                <p className="rejection-reason">
                  <strong>Lý do:</strong> {payment.rejectionReason}
                </p>
              )}
              <p className="rejection-instruction">
                Vui lòng upload minh chứng thanh toán mới bên dưới.
              </p>
              <button
                className="btn-retry-payment"
                onClick={handleRetryPayment}
              >
                Làm mới trang
              </button>
            </div>
          </div>
        )}

        <div className="payment-content">
          {/* QR Code Section */}
          <div className="qr-section">
            <h2>Quét mã QR để thanh toán</h2>
            {qrCodeUrl && (
              <div className="qr-code-box">
                <img src={qrCodeUrl} alt="QR Code" className="qr-code-image" />
                <p className="qr-instruction">
                  Mở app ngân hàng và quét mã QR này
                </p>
              </div>
            )}
          </div>

          {/* Bank Info Section */}
          <div className="bank-info-section">
            <h2>Hoặc chuyển khoản thủ công</h2>
            <div className="bank-info-box">
              <div className="info-row">
                <span className="label">Ngân hàng:</span>
                <span className="value">{bankInfo.bankName}</span>
              </div>
              <div className="info-row">
                <span className="label">Số tài khoản:</span>
                <span
                  className="value copyable"
                  onClick={() => copyToClipboard(bankInfo.accountNo)}
                >
                  {bankInfo.accountNo} <span className="copy-icon"></span>
                </span>
              </div>
              <div className="info-row">
                <span className="label">Chủ tài khoản:</span>
                <span className="value">{bankInfo.accountName}</span>
              </div>
              <div className="info-row highlight">
                <span className="label">Số tiền:</span>
                <span className="value amount">
                  {payment?.amount?.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className="info-row highlight">
                <span className="label">Nội dung CK:</span>
                <span
                  className="value copyable"
                  onClick={() => copyToClipboard(payment?.transferContent)}
                >
                  {payment?.transferContent} <span className="copy-icon"></span>
                </span>
              </div>
            </div>

            <div className="warning-box">
              <strong>Lưu ý quan trọng:</strong>
              <ul>
                <li>
                  Chuyển khoản <strong>ĐÚNG số tiền</strong> và{' '}
                  <strong>ĐÚNG nội dung</strong>
                </li>
                <li>Sau khi chuyển khoản, vui lòng upload ảnh minh chứng</li>
                <li>Admin sẽ duyệt trong vòng 5-10 phút</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons-row">
          <button className="btn-back" onClick={handleBackToCart}>
            ← Quay lại
          </button>

          {(payment?.status === 'PENDING' ||
            payment?.status === 'REJECTED') && (
            <button className="btn-upload-proof" onClick={handleUploadProof}>
              {payment?.status === 'REJECTED'
                ? 'Upload lại minh chứng'
                : 'Upload minh chứng'}
            </button>
          )}
        </div>

        {payment?.status === 'AWAITING_CONFIRMATION' && (
          <div className="awaiting-box">
            <div className="spinner"></div>
            <p>Đã nhận minh chứng! Đang chờ admin duyệt...</p>
          </div>
        )}

        {/* Upload Proof Modal */}
        {showUploadProof && (
          <UploadProofModal
            paymentId={payment.id}
            userId={userId}
            onClose={() => setShowUploadProof(false)}
            onSuccess={() => {
              setShowUploadProof(false);
              fetchPaymentInfo();
            }}
          />
        )}
      </div>
    </div>
  );
};

// Component Upload Proof Modal
const UploadProofModal = ({ paymentId, userId, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState('');
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Vui lòng chọn ảnh minh chứng');
      return;
    }

    try {
      setUploading(true);
      const response = await ApiService.uploadPaymentProof(
        paymentId,
        file,
        note,
        userId
      );

      if (response.success) {
        alert('Upload minh chứng thành công! Vui lòng chờ admin duyệt.');
        onSuccess();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload minh chứng thanh toán</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Ảnh chuyển khoản *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Ghi chú (tùy chọn)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Đã chuyển khoản lúc 14:30"
              rows="3"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={uploading}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? 'Đang upload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper function
const getStatusText = (status) => {
  const statusMap = {
    PENDING: 'Chờ thanh toán',
    AWAITING_CONFIRMATION: 'Chờ xác nhận',
    PAID: 'Đã thanh toán',
    REJECTED: 'Bị từ chối',
    EXPIRED: 'Đã hết hạn',
  };
  return statusMap[status] || status;
};

export default PaymentPage;
