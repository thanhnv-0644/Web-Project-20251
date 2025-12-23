package com.phegondev.Phegon.Eccormerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.phegondev.Phegon.Eccormerce.entity.Payment;
import com.phegondev.Phegon.Eccormerce.enums.PaymentStatus;

public interface PaymentRepo extends JpaRepository<Payment,Long> {
    Optional<Payment> findById(Long id);
    
    // One-to-One: 1 Order chỉ có 1 Payment duy nhất
    Optional<Payment> findByOrder_Id(Long orderId);
    
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
}
