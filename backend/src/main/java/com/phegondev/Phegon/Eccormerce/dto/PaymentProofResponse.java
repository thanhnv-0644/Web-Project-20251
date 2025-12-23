package com.phegondev.Phegon.Eccormerce.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentProofResponse {

    private Long id;

    private Long paymentId;

    private String imageUrl;

    private String note;

    /**
     * Trạng thái của proof:
     * ACTIVE / REPLACED / REJECTED / APPROVED (tuỳ enum của bạn)
     */
    private String status;

    private LocalDateTime uploadedAt;
}
