package com.phegondev.Phegon.Eccormerce.service.interf;

import com.phegondev.Phegon.Eccormerce.dto.ReviewRequestDto;
import com.phegondev.Phegon.Eccormerce.dto.Response;

public interface ReviewService {

    Response addReview(ReviewRequestDto reviewRequestDto);

    Response getReviewsByProduct(Long productId);

    Response updateReview(Long reviewId, ReviewRequestDto dto);
    
    Response deleteReview(Long reviewId);
}
