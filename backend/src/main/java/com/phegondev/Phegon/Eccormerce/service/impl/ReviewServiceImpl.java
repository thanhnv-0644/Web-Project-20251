package com.phegondev.Phegon.Eccormerce.service.impl;

import com.phegondev.Phegon.Eccormerce.dto.Response;
import com.phegondev.Phegon.Eccormerce.dto.ReviewRequestDto;
import com.phegondev.Phegon.Eccormerce.dto.ReviewResponseDto;
import com.phegondev.Phegon.Eccormerce.entity.Product;
import com.phegondev.Phegon.Eccormerce.entity.Review;
import com.phegondev.Phegon.Eccormerce.entity.User;
import com.phegondev.Phegon.Eccormerce.repository.ProductRepo;
import com.phegondev.Phegon.Eccormerce.repository.ReviewRepo;
import com.phegondev.Phegon.Eccormerce.repository.UserRepo;
import com.phegondev.Phegon.Eccormerce.service.interf.ReviewService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepo reviewRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;

    @Override
    public Response addReview(ReviewRequestDto dto) {

        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Product product = productRepo.findById(dto.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        
        Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = new Review();
        review.setContent(dto.getContent());
        review.setRating(dto.getRating());
        review.setProduct(product);
        review.setUser(user);

        reviewRepo.save(review);

        return Response.builder()
                .status(200)
                .message("Review added successfully")
                .build();
    }

    @Override
    public Response getReviewsByProduct(Long productId) {

        List<ReviewResponseDto> reviews =
                reviewRepo.findByProductIdOrderByCreatedAtDesc(productId)
                        .stream()
                        .map(r -> new ReviewResponseDto(
                                r.getId(),
                                r.getContent(),
                                r.getRating(),
                                r.getUser().getName(),
                                r.getCreatedAt()
                        ))
                        .toList();

        Double avgRating = reviewRepo.getAverageRating(productId);

        return Response.builder()
                .status(200)
                .reviews(reviews)
                .averageRating(avgRating == null ? 0 : avgRating)
                .build();
    }
}
