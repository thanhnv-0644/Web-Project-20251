package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@AllArgsConstructor
@NoArgsConstructor


@Data
public class ReviewRequestDto {
    private Long productId;
    private String content;
    private int rating;
}
