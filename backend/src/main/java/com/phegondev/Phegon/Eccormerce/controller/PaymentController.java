package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.PaymentResponse;
import com.phegondev.Phegon.Eccormerce.entity.Order;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;
import com.phegondev.Phegon.Eccormerce.repository.OrderRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepo;
import com.phegondev.Phegon.Eccormerce.service.VietQrService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller xử lý Payment và tạo QR code VietQR
 * - Tạo payment cho order
 * - Tạo QR code để user chuyển khoản
 * - Kiểm tra trạng thái payment
 */
@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepo paymentRepo;
    private final OrderRepo orderRepo;
    private final VietQrService vietQrService;

    /**
     * Tạo payment cho order và trả về QR code
     * POST /api/payments/create-for-order/{orderId}
     * 
     * Request body (optional):
     * {
     *   "method": "VIETQR",
     *   "expirationMinutes": 15
     * }
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Tạo payment thành công!",
     *   "data": {
     *     "payment": { PaymentResponse },
     *     "qrCodeUrl": "https://img.vietqr.io/image/...",
     *     "transferContent": "PAY123",
     *     "bankInfo": {
     *       "bankName": "VietinBank",
     *       "accountNo": "107875830631",
     *       "accountName": "Nguyen Minh Hoang"
     *     }
     *   }
     * }
     */
    @PostMapping(
            value = "/create-for-order/{orderId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> createPaymentForOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) Map<String, Object> requestBody
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Kiểm tra order có tồn tại không
            Order order = orderRepo.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Order không tồn tại: " + orderId));

            // ONE-TO-ONE: Kiểm tra order đã có payment chưa
            Optional<Payment> existingPaymentOpt = paymentRepo.findByOrder_Id(orderId);
            
            if (existingPaymentOpt.isPresent()) {
                Payment existingPayment = existingPaymentOpt.get();
                PaymentStatus status = existingPayment.getStatus();
                
                // Nếu đã PAID thì không cho thao tác gì nữa
                if (status == PaymentStatus.PAID) {
                    response.put("success", false);
                    response.put("message", "Order này đã được thanh toán rồi!");
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                }
                
                // Nếu PENDING, AWAITING_CONFIRMATION, hoặc REJECTED → Trả về payment hiện tại
                // User sẽ upload PaymentProof mới vào cùng Payment này
                response.put("success", true);
                response.put("message", status == PaymentStatus.REJECTED 
                    ? "Payment bị từ chối. Vui lòng upload minh chứng mới." 
                    : "Payment đã tồn tại. Vui lòng thanh toán.");
                response.put("data", buildPaymentResponseData(existingPayment));
                return ResponseEntity.ok(response);
            }

            // Lấy thông tin từ request
            String method = requestBody != null && requestBody.containsKey("method") 
                    ? (String) requestBody.get("method") 
                    : "VIETQR";
            
            Integer expirationMinutes = requestBody != null && requestBody.containsKey("expirationMinutes")
                    ? (Integer) requestBody.get("expirationMinutes")
                    : 15; // Mặc định 15 phút

            // Tạo payment mới (chỉ khi chưa có payment nào)
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalPrice());
            payment.setMethod(method);
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransferContent(generateTransferContent(orderId)); // PAY{orderId}
            payment.setExpiredAt(LocalDateTime.now().plusMinutes(expirationMinutes));
            payment.setCreatedAt(LocalDateTime.now());

            Payment savedPayment = paymentRepo.save(payment);

            // Tạo response
            response.put("success", true);
            response.put("message", "Tạo payment thành công! Vui lòng quét mã QR để chuyển khoản.");
            response.put("data", buildPaymentResponseData(savedPayment));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông tin payment + QR code theo orderId
     * GET /api/payments/by-order/{orderId}
     * 
     * Response: giống như create-for-order
     */
    @GetMapping(
            value = "/by-order/{orderId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getPaymentByOrder(@PathVariable Long orderId) {
        Map<String, Object> response = new HashMap<>();

        try {
            // ONE-TO-ONE: Lấy payment duy nhất của order
            Payment payment = paymentRepo.findByOrder_Id(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Chưa có payment cho order này"));

            response.put("success", true);
            response.put("message", "Lấy thông tin payment thành công");
            response.put("data", buildPaymentResponseData(payment));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy thông tin payment + QR code theo paymentId
     * GET /api/payments/{paymentId}
     */
    @GetMapping(
            value = "/{paymentId}",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getPaymentById(@PathVariable Long paymentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Payment payment = paymentRepo.findById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment không tồn tại"));

            response.put("success", true);
            response.put("message", "Lấy thông tin payment thành công");
            response.put("data", buildPaymentResponseData(payment));

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Kiểm tra trạng thái payment (để frontend polling)
     * GET /api/payments/{paymentId}/status
     * 
     * Response:
     * {
     *   "success": true,
     *   "status": "PAID",
     *   "message": "Thanh toán thành công!"
     * }
     */
    @GetMapping(
            value = "/{paymentId}/status",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> checkPaymentStatus(@PathVariable Long paymentId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Payment payment = paymentRepo.findById(paymentId)
                    .orElseThrow(() -> new IllegalArgumentException("Payment không tồn tại"));

            response.put("success", true);
            response.put("status", payment.getStatus().name());
            response.put("message", getStatusMessage(payment.getStatus()));
            
            // Thêm thông tin chi tiết nếu cần
            if (payment.getStatus() == PaymentStatus.PAID) {
                response.put("paidAt", payment.getPaidAt());
            } else if (payment.getStatus() == PaymentStatus.EXPIRED) {
                response.put("expiredAt", payment.getExpiredAt());
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Tạo nội dung chuyển khoản unique
     */
    private String generateTransferContent(Long orderId) {
        return "PAY" + orderId;
    }

    /**
     * Build response data với payment + QR code + bank info
     */
    private Map<String, Object> buildPaymentResponseData(Payment payment) {
        Map<String, Object> data = new HashMap<>();

        // Payment info
        PaymentResponse paymentResponse = PaymentResponse.builder()
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
                .build();

        data.put("payment", paymentResponse);

        // QR Code URL (chỉ tạo nếu chưa PAID)
        if (payment.getStatus() != PaymentStatus.PAID) {
            String qrCodeUrl = vietQrService.buildQrImageUrl(
                    payment.getAmount(),
                    payment.getTransferContent()
            );
            data.put("qrCodeUrl", qrCodeUrl);
            data.put("transferContent", payment.getTransferContent());
        }

        // Bank info
        Map<String, String> bankInfo = new HashMap<>();
        bankInfo.put("bankName", "VietinBank"); // Có thể lấy từ config
        bankInfo.put("accountNo", "107875830631"); // Từ application.properties
        bankInfo.put("accountName", "Nguyen Minh Hoang"); // Từ application.properties
        data.put("bankInfo", bankInfo);

        return data;
    }

    /**
     * Lấy message theo status
     */
    private String getStatusMessage(PaymentStatus status) {
        return switch (status) {
            case PENDING -> "Chờ thanh toán. Vui lòng quét mã QR và chuyển khoản.";
            case AWAITING_CONFIRMATION -> "Đã nhận minh chứng. Đang chờ admin duyệt.";
            case PAID -> "Thanh toán thành công!";
            case REJECTED -> "Thanh toán bị từ chối. Vui lòng upload lại minh chứng.";
            case EXPIRED -> "Thanh toán đã hết hạn.";
        };
    }
}

