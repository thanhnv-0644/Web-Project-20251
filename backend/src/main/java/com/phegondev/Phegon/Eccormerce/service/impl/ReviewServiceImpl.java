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
import com.phegondev.Phegon.Eccormerce.enums.UserRole;
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

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String currentEmail =
            (auth != null && !auth.getName().equals("anonymousUser"))
                    ? auth.getName()
                    : null;

    
    User user =
            currentEmail != null
                    ? userRepo.findByEmail(currentEmail).orElse(null)
                    : null;

    
    final Long currentUserId = user != null ? user.getId() : null;
    final boolean isAdmin =
            user != null && user.getRole() == UserRole.ADMIN;

    List<ReviewResponseDto> reviews =
            reviewRepo.findByProductIdOrderByCreatedAtDesc(productId)
                    .stream()
                    .map(r -> {

                        boolean isOwner =
                                currentUserId != null &&
                                r.getUser().getId().equals(currentUserId);

                        boolean canEdit = isOwner;
                        boolean canDelete = isOwner || isAdmin;

                        return new ReviewResponseDto(
                                r.getId(),
                                r.getContent(),
                                r.getRating(),
                                r.getUser().getId(),
                                r.getUser().getName(),
                                r.getCreatedAt(),
                                r.getUser().getRole().getValue(),
                                canEdit,
                                canDelete
                        );
                    })
                    .toList();

    Double avgRating = reviewRepo.getAverageRating(productId);

    return Response.builder()
            .status(200)
            .reviews(reviews)
            .averageRating(avgRating == null ? 0 : avgRating)
            .build();
}

    @Override
public Response updateReview(Long reviewId, ReviewRequestDto dto) {

    if (dto.getRating() < 1 || dto.getRating() > 5) {
        throw new IllegalArgumentException("Rating must be between 1 and 5");
    }

    Authentication authentication =
            SecurityContextHolder.getContext().getAuthentication();

    String email = authentication.getName();

    User currentUser = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Review review = reviewRepo.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

    if (!review.getUser().getId().equals(currentUser.getId())) {
        throw new RuntimeException("You are not allowed to update this review");
    }

    review.setContent(dto.getContent());
    review.setRating(dto.getRating());

    reviewRepo.save(review);

    return Response.builder()
            .status(200)
            .message("Review updated successfully")
            .build();
}

@Override
public Response deleteReview(Long reviewId) {

    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    String email = auth.getName();

    User currentUser = userRepo.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

    Review review = reviewRepo.findById(reviewId)
            .orElseThrow(() -> new RuntimeException("Review not found"));

    boolean isOwner = review.getUser().getId().equals(currentUser.getId());
    boolean isAdmin = currentUser.getRole() == UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
        throw new RuntimeException("You are not allowed to delete this review");
    }

    reviewRepo.delete(review);

    return Response.builder()
            .status(200)
            .message("Review deleted successfully")
            .build();
}


}
