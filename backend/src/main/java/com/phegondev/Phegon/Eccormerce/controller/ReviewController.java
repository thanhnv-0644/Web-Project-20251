package com.phegondev.Phegon.Eccormerce.controller;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.ReviewRequestDto;
import com.phegondev.Phegon.Eccormerce.service.interf.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Response> addReview(
            @RequestBody ReviewRequestDto dto) {
        return ResponseEntity.ok(reviewService.addReview(dto));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Response> getReviews(
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                reviewService.getReviewsByProduct(productId)
        );
    }
}
