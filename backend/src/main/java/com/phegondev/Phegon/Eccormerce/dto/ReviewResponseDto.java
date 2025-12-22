package com.phegondev.Phegon.Eccormerce.dto;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private String content;
    private int rating;
    private String userName;
    private LocalDateTime createdAt;
}
