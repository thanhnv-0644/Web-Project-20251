package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.PaymentProofResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PaymentProofService {
    PaymentProofResponse uploadProof(Long paymentId, MultipartFile file, String note, Long userId);
    List<PaymentProofResponse> getProofsByPayment(Long paymentId, Long requesterId);
}
