package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.PaymentProofResponse;
import com.phegondev.Phegon.Eccormerce.dto.PaymentResponse;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.entity.PaymentProof;
import com.phegondev.Phegon.Eccormerce.enums.PaymentProofStatus;
import com.phegondev.Phegon.Eccormerce.repository.PaymentProofRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentProofService;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller cho Admin quản lý thanh toán
 * - Xem danh sách thanh toán chờ duyệt
 * - Duyệt/Từ chối thanh toán
 * - Xem chi tiết payment + minh chứng
 */
@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ADMIN')") // Chỉ ADMIN mới truy cập được
public class AdminPaymentController {

    private final PaymentService paymentService;
    private final PaymentProofService paymentProofService;
    private final PaymentProofRepo paymentProofRepo;

    /**
     * Lấy danh sách payments đang chờ duyệt (AWAITING_CONFIRMATION)
     * GET /api/admin/payments/awaiting-confirmation
     * 
     * Response: List<PaymentResponse> với thông tin payment + proof mới nhất
     */
    @GetMapping(
            value = "/awaiting-confirmation",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<List<PaymentResponse>> getPaymentsAwaitingConfirmation() {
        List<Payment> payments = paymentService.getPaymentsAwaitingConfirmation();
        
        List<PaymentResponse> responses = payments.stream()
                .map(this::toPaymentResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }

    /**
     * Lấy chi tiết 1 payment (bao gồm tất cả minh chứng)
     * GET /api/admin/payments/{paymentId}
     * 
     * Response: PaymentResponse + danh sách tất cả proofs
     */
    @GetMapping(
            value = "/{paymentId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getPaymentDetail(
            @PathVariable Long paymentId,
            @RequestHeader(name = "X-ADMIN-ID") Long adminId
    ) {
        // Lấy payment
        Payment payment = paymentService.getPaymentById(paymentId, adminId);
        
        // Lấy tất cả proofs
        List<PaymentProofResponse> proofs = paymentProofService.getProofsByPayment(paymentId, adminId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("payment", toPaymentResponse(payment));
        response.put("proofs", proofs);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Admin duyệt thanh toán
     * POST /api/admin/payments/{paymentId}/approve
     * 
     * Request body: không cần (hoặc có thể thêm note)
     * Response: PaymentResponse đã được approve
     */
    @PostMapping(
            value = "/{paymentId}/approve",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> approvePayment(
            @PathVariable Long paymentId,
            @RequestHeader(name = "X-ADMIN-ID") Long adminId
    ) {
        try {
            Payment payment = paymentService.approvePayment(paymentId, adminId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thanh toán đã được duyệt thành công!");
            response.put("payment", toPaymentResponse(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
            
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(409).body(error); // 409 Conflict
        }
    }

    /**
     * Admin từ chối thanh toán
     * POST /api/admin/payments/{paymentId}/reject
     * 
     * Request body: { "reason": "Ảnh không rõ ràng" }
     * Response: PaymentResponse đã bị reject
     */
    @PostMapping(
            value = "/{paymentId}/reject",
            produces = MediaType.APPLICATION_JSON_VALUE,
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> rejectPayment(
            @PathVariable Long paymentId,
            @RequestHeader(name = "X-ADMIN-ID") Long adminId,
            @RequestBody(required = false) Map<String, String> requestBody
    ) {
        try {
            String reason = requestBody != null ? requestBody.get("reason") : "Không đạt yêu cầu";
            
            Payment payment = paymentService.rejectPayment(paymentId, adminId, reason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Thanh toán đã bị từ chối!");
            response.put("reason", reason);
            response.put("payment", toPaymentResponse(payment));
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
            
        } catch (IllegalStateException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(409).body(error);
        }
    }

    /**
     * Admin xem tất cả payments (tất cả trạng thái)
     * GET /api/admin/payments
     * 
     * Query params: ?status=PAID (optional)
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<PaymentResponse>> getAllPayments(
            @RequestParam(required = false) String status
    ) {
        // TODO: Implement nếu cần - hiện tại chỉ có awaiting-confirmation
        // Bạn có thể thêm method findAll hoặc findByStatus vào PaymentRepo
        return ResponseEntity.ok(List.of());
    }

    /**
     * Helper method: Convert Payment entity -> PaymentResponse DTO
     */
    private PaymentResponse toPaymentResponse(Payment payment) {
        // Lấy proof ACTIVE mới nhất (nếu có)
        PaymentProofResponse latestProof = paymentProofRepo
                .findFirstByPayment_IdAndStatusOrderByUploadedAtDesc(
                        payment.getId(), 
                        PaymentProofStatus.ACTIVE
                )
                .map(this::toProofResponse)
                .orElse(null);
        
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus().name())
                .transferContent(payment.getTransferContent())
                .paidAt(payment.getPaidAt())
                .expiredAt(payment.getExpiredAt())
                .approvedBy(payment.getApprovedBy())
                .approvedAt(payment.getApprovedAt())
                .createdAt(payment.getCreatedAt())
                .rejectionReason(payment.getRejectionReason())
                .latestProof(latestProof)
                .build();
    }

    /**
     * Helper method: Convert PaymentProof entity -> PaymentProofResponse DTO
     */
    private PaymentProofResponse toProofResponse(PaymentProof proof) {
        return PaymentProofResponse.builder()
                .id(proof.getId())
                .paymentId(proof.getPayment().getId())
                .imageUrl(proof.getImageUrl())
                .note(proof.getNote())
                .status(proof.getStatus().name())
                .uploadedAt(proof.getUploadedAt())
                .build();
    }
}

