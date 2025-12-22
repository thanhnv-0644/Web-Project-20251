package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDto {

    private Long id;
    private String content;
    private int rating;

    private String userName;
    private LocalDateTime createdAt;
    private int role;
    private boolean canEdit;
    private boolean canDelete;
}
