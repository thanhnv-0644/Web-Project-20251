package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.PaymentProofResponse;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller cho User upload minh chứng thanh toán
 * - Upload ảnh chuyển khoản
 * - Xem lịch sử minh chứng đã upload
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentProofController {

    private final PaymentProofService paymentProofService;

    /**
     * User upload minh chứng thanh toán
     * POST /api/payments/{paymentId}/proof
     * 
     * Form-data:
     * - file: ảnh minh chứng (JPG/PNG/WEBP, max 5MB)
     * - note: ghi chú (optional)
     * 
     * Headers:
     * - X-USER-ID: userId (tạm thời, production nên dùng JWT)
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Upload minh chứng thành công!",
     *   "data": { PaymentProofResponse }
     * }
     */
    @PostMapping(
            value = "/{paymentId}/proof",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> uploadProof(
            @PathVariable Long paymentId,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "note", required = false) String note,
            @RequestHeader(name = "X-USER-ID") Long userId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            PaymentProofResponse proof = paymentProofService.uploadProof(paymentId, file, note, userId);
            
            response.put("success", true);
            response.put("message", "Upload minh chứng thành công! Vui lòng chờ admin duyệt.");
            response.put("data", proof);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            // Lỗi validation: payment không tồn tại, file không hợp lệ, etc.
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
            
        } catch (IllegalStateException e) {
            // Lỗi trạng thái: payment đã PAID
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response); // 409 Conflict
            
        } catch (Exception e) {
            // Lỗi không mong đợi (upload Cloudinary fail, etc.)
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Lấy danh sách tất cả minh chứng của 1 payment
     * GET /api/payments/{paymentId}/proofs
     * 
     * Headers:
     * - X-USER-ID: requesterId (tạm thời)
     * 
     * Response:
     * {
     *   "success": true,
     *   "message": "Lấy danh sách minh chứng thành công",
     *   "data": [ PaymentProofResponse... ]
     * }
     */
    @GetMapping(
            value = "/{paymentId}/proofs",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getProofsByPayment(
            @PathVariable Long paymentId,
            @RequestHeader(name = "X-USER-ID") Long requesterId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<PaymentProofResponse> proofs = paymentProofService.getProofsByPayment(paymentId, requesterId);
            
            response.put("success", true);
            response.put("message", "Lấy danh sách minh chứng thành công");
            response.put("data", proofs);
            response.put("total", proofs.size());
            
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
     * User kiểm tra trạng thái minh chứng mới nhất
     * GET /api/payments/{paymentId}/proof/latest
     * 
     * Trả về minh chứng ACTIVE mới nhất (đang chờ duyệt)
     */
    @GetMapping(
            value = "/{paymentId}/proof/latest",
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Map<String, Object>> getLatestProof(
            @PathVariable Long paymentId,
            @RequestHeader(name = "X-USER-ID") Long userId
    ) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<PaymentProofResponse> proofs = paymentProofService.getProofsByPayment(paymentId, userId);
            
            // Lấy proof ACTIVE mới nhất
            PaymentProofResponse latestProof = proofs.stream()
                    .filter(p -> "ACTIVE".equals(p.getStatus()))
                    .findFirst()
                    .orElse(null);
            
            if (latestProof != null) {
                response.put("success", true);
                response.put("message", "Minh chứng đang chờ admin duyệt");
                response.put("data", latestProof);
            } else {
                response.put("success", false);
                response.put("message", "Chưa có minh chứng nào hoặc đã bị thay thế");
                response.put("data", null);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi hệ thống: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
