package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.entity.PaymentProof;
import com.phegondev.Phegon.Eccormerce.enums.OrderStatus;
import com.phegondev.Phegon.Eccormerce.enums.PaymentProofStatus;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentProofRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepo paymentRepo;
    private final PaymentProofRepo paymentProofRepo;
    private final OrderRepo orderRepo;

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(Long paymentId, Long requesterId) {
        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        // OPTIONAL: check quyền nếu Order có user
        // if (!payment.getOrder().getUser().getId().equals(requesterId) && !isAdmin(requesterId))
        //     throw new SecurityException("Forbidden");

        return payment;
    }

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentByOrderId(Long orderId, Long requesterId) {
        if (orderId == null) throw new IllegalArgumentException("orderId is required");

        Payment payment = paymentRepo.findByOrder_Id(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for orderId: " + orderId));

        // OPTIONAL: check quyền
        return payment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsAwaitingConfirmation() {
        return paymentRepo.findByStatusOrderByCreatedAtDesc(PaymentStatus.AWAITING_CONFIRMATION);
    }

    @Override
    @Transactional
    public Payment approvePayment(Long paymentId, Long adminId) {
        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (payment.getStatus() != PaymentStatus.AWAITING_CONFIRMATION) {
            throw new IllegalStateException("Payment must be AWAITING_CONFIRMATION to approve");
        }

        // Proof đang chờ duyệt chính là proof ACTIVE mới nhất
        PaymentProof activeProof = paymentProofRepo
                .findFirstByPayment_IdAndStatusOrderByUploadedAtDesc(paymentId, PaymentProofStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("No ACTIVE payment proof to approve"));

        // Update payment
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setApprovedBy(adminId);
        payment.setApprovedAt(LocalDateTime.now());

        // Update proof -> APPROVED (không còn ACTIVE nữa để tránh user upload đè logic)
        activeProof.setStatus(PaymentProofStatus.APPROVED);
        paymentProofRepo.save(activeProof);

        // CẬP NHẬT TRẠNG THÁI ORDER: PENDING -> CONFIRMED
        Order order = payment.getOrder();
        if (order != null && order.getStatus() == OrderStatus.PENDING) {
            order.setStatus(OrderStatus.CONFIRMED);
            orderRepo.save(order);
        }

        return paymentRepo.save(payment);
    }

    @Override
    @Transactional
    public Payment rejectPayment(Long paymentId, Long adminId, String reason) {
        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        if (payment.getStatus() != PaymentStatus.AWAITING_CONFIRMATION) {
            throw new IllegalStateException("Payment must be AWAITING_CONFIRMATION to reject");
        }

        PaymentProof activeProof = paymentProofRepo
                .findFirstByPayment_IdAndStatusOrderByUploadedAtDesc(paymentId, PaymentProofStatus.ACTIVE)
                .orElseThrow(() -> new IllegalStateException("No ACTIVE payment proof to reject"));

        // Update payment
        payment.setStatus(PaymentStatus.REJECTED);
        payment.setApprovedBy(adminId);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setRejectionReason(reason);

        // Update proof -> REJECTED (giữ lại lịch sử)
        activeProof.setStatus(PaymentProofStatus.REJECTED);
        paymentProofRepo.save(activeProof);

        return paymentRepo.save(payment);
    }

    @Override
    @Transactional
    public Payment expirePayment(Long paymentId) {
        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        payment.setStatus(PaymentStatus.EXPIRED);
        return paymentRepo.save(payment);
    }
}
