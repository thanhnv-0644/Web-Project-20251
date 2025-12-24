package com.phegondev.Phegon.Eccormerce.enums;

public enum PaymentStatus {
    PENDING, // Mới tạo, chưa nộp minh chứng
    AWAITING_CONFIRMATION, // Đã nộp ảnh, chờ admin duyệt
    PAID, // Admin duyệt ok
    REJECTED, // Admin từ chối
    EXPIRED // Hết hạn
}
