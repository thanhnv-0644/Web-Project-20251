package com.phegondev.Phegon.Eccormerce.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponse {

    private Long id;
    
    private Long orderId;
    
    private BigDecimal amount;
    
    private String method;
    
    /**
     * Trạng thái: PENDING / AWAITING_CONFIRMATION / PAID / REJECTED / EXPIRED
     */
    private String status;
    
    private String transferContent;
    
    private LocalDateTime paidAt;
    
    private LocalDateTime expiredAt;
    
    private Long approvedBy;
    
    private LocalDateTime approvedAt;
    
    private LocalDateTime createdAt;
    
    private String rejectionReason;
    
    /**
     * Minh chứng thanh toán mới nhất (ACTIVE)
     */
    private PaymentProofResponse latestProof;
}

