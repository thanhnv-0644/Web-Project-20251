package com.phegondev.Phegon.Eccormerce.repository;

import com.phegondev.Phegon.Eccormerce.entity.PaymentProof;
import com.phegondev.Phegon.Eccormerce.enums.PaymentProofStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentProofRepo extends JpaRepository<PaymentProof, Long> {
    // Lấy proof ACTIVE mới nhất của 1 payment (để đổi sang REPLACED khi user upload mới)
    Optional<PaymentProof> findFirstByPayment_IdAndStatusOrderByUploadedAtDesc(
            Long paymentId,
            PaymentProofStatus status
    );

    // Lấy tất cả proofs của payment (hiển thị lịch sử)
    List<PaymentProof> findByPayment_IdOrderByUploadedAtDesc(Long paymentId);
}
