package com.phegondev.Phegon.Eccormerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * DTO chứa kết quả upload lên Cloudinary
 * Bao gồm cả URL và publicId để có thể xóa ảnh sau này
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryUploadResult {
    
    /**
     * URL đầy đủ của ảnh trên Cloudinary (secure_url)
     * Ví dụ: https://res.cloudinary.com/xxx/image/upload/v123/phegon-ecommerce/abc123.jpg
     */
    private String imageUrl;
    
    /**
     * Public ID của ảnh trên Cloudinary (để xóa)
     * Ví dụ: phegon-ecommerce/abc123
     */
    private String publicId;
    
    /**
     * Kích thước file (bytes)
     */
    private Long fileSize;
    
    /**
     * Định dạng ảnh (jpg, png, webp)
     */
    private String format;
}

