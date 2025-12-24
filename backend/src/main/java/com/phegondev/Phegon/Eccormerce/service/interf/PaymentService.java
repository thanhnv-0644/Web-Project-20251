package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.entity.Payment;

import java.util.List;

public interface PaymentService {

    // User: lấy payment theo id (có thể check quyền ở impl)
    Payment getPaymentById(Long paymentId, Long requesterId);

    // User: lấy payment theo orderId
    Payment getPaymentByOrderId(Long orderId, Long requesterId);

    // Admin: list payment đang chờ duyệt
    List<Payment> getPaymentsAwaitingConfirmation();

    // Admin: duyệt thanh toán
    Payment approvePayment(Long paymentId, Long adminId);

    // Admin: từ chối thanh toán (có thể kèm reason nếu bạn muốn mở rộng)
    Payment rejectPayment(Long paymentId, Long adminId, String reason);

    // (Optional) Admin/System: expire payment nếu quá hạn
    Payment expirePayment(Long paymentId);
}
