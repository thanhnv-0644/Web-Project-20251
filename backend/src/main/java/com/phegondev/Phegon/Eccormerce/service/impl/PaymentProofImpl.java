package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.CloudinaryUploadResult;
import com.phegondev.Phegon.Eccormerce.dto.PaymentProofResponse;
import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.entity.PaymentProof;
import com.phegondev.Phegon.Eccormerce.enums.PaymentProofStatus;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;
import com.phegondev.Phegon.Eccormerce.repository.PaymentProofRepo;
import com.phegondev.Phegon.Eccormerce.repository.PaymentRepo;
import com.phegondev.Phegon.Eccormerce.service.CloudinaryService;
import com.phegondev.Phegon.Eccormerce.service.interf.PaymentProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentProofImpl implements PaymentProofService {

    private final PaymentProofRepo paymentProofRepo;
    private final PaymentRepo paymentRepo;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public PaymentProofResponse uploadProof(Long paymentId, MultipartFile file, String note, Long userId) {

        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("File is required");
        validateImage(file);

        Payment payment = paymentRepo.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found: " + paymentId));

        // Optional check quyền sở hữu nếu Order có user
        // if (!payment.getOrder().getUser().getId().equals(userId)) throw new SecurityException("Forbidden");

        if (payment.getStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Payment already PAID, cannot upload proof");
        }
        if (payment.getStatus() == PaymentStatus.EXPIRED) {
            throw new IllegalStateException("Payment EXPIRED, cannot upload proof");
        }

        // Upload lên Cloudinary => lấy URL + publicId
        CloudinaryUploadResult uploadResult = cloudinaryService.uploadImageWithDetails(file);

        // Rule: chỉ REPLACE proof ACTIVE hiện tại (KHÔNG đụng REJECTED cũ)
        paymentProofRepo.findFirstByPayment_IdAndStatusOrderByUploadedAtDesc(paymentId, PaymentProofStatus.ACTIVE)
                .ifPresent(active -> {
                    active.setStatus(PaymentProofStatus.REPLACED);
                    paymentProofRepo.save(active);
                });

        // Tạo proof mới
        PaymentProof proof = new PaymentProof();
        proof.setPayment(payment);
        proof.setImageUrl(uploadResult.getImageUrl());
        proof.setPublicId(uploadResult.getPublicId()); // Lưu publicId để có thể xóa sau
        proof.setNote(note);
        proof.setUploadedAt(LocalDateTime.now());
        proof.setStatus(PaymentProofStatus.ACTIVE);

        PaymentProof saved = paymentProofRepo.save(proof);

        // Sau khi nộp ảnh => chờ admin duyệt
        payment.setStatus(PaymentStatus.AWAITING_CONFIRMATION);
        paymentRepo.save(payment);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentProofResponse> getProofsByPayment(Long paymentId, Long requesterId) {

        if (paymentId == null) throw new IllegalArgumentException("paymentId is required");

        // Optional check quyền (owner/admin)
        return paymentProofRepo.findByPayment_IdOrderByUploadedAtDesc(paymentId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private void validateImage(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null) throw new IllegalArgumentException("Invalid file type");

        boolean ok = contentType.equalsIgnoreCase("image/jpeg")
                || contentType.equalsIgnoreCase("image/png")
                || contentType.equalsIgnoreCase("image/webp");

        if (!ok) throw new IllegalArgumentException("Only JPG/PNG/WEBP images are allowed");

        long max = 5L * 1024 * 1024; // 5MB
        if (file.getSize() > max) throw new IllegalArgumentException("File too large. Max 5MB");
    }

    private PaymentProofResponse toResponse(PaymentProof proof) {
        // Bạn sửa map theo đúng PaymentProofResponse thật của bạn (field nào có thì map)
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
