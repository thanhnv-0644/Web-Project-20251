package com.phegondev.Phegon.Eccormerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.phegondev.Phegon.Eccormerce.dto.CloudinaryUploadResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Upload ảnh lên Cloudinary và trả về đầy đủ thông tin (URL + publicId)
     * @param photo - file ảnh từ MultipartFile
     * @return CloudinaryUploadResult chứa URL, publicId, fileSize, format
     */
    public CloudinaryUploadResult uploadImageWithDetails(MultipartFile photo) {
        try {
            // Tạo Cloudinary instance với credentials
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));

            // Tạo tên file unique để tránh trùng lặp
            String publicId = UUID.randomUUID().toString();

            // Upload ảnh lên Cloudinary
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(photo.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "folder", "phegon-ecommerce", // Tạo folder riêng trên Cloudinary
                            "resource_type", "auto" // Tự động detect loại file
                    ));

            // Lấy thông tin từ kết quả upload
            String imageUrl = (String) uploadResult.get("secure_url");
            String fullPublicId = (String) uploadResult.get("public_id"); // phegon-ecommerce/uuid
            Long bytes = uploadResult.get("bytes") != null ? 
                    Long.valueOf(uploadResult.get("bytes").toString()) : 0L;
            String format = (String) uploadResult.get("format");

            log.info("Image uploaded successfully to Cloudinary: {} (publicId: {})", imageUrl, fullPublicId);

            return CloudinaryUploadResult.builder()
                    .imageUrl(imageUrl)
                    .publicId(fullPublicId)
                    .fileSize(bytes)
                    .format(format)
                    .build();

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể upload ảnh lên Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Upload ảnh lên Cloudinary và chỉ trả về URL (backward compatibility)
     * Method này giữ lại để không phá vỡ code cũ (ProductServiceImpl đang dùng)
     * 
     * @param photo - file ảnh từ MultipartFile
     * @return URL của ảnh trên Cloudinary
     */
    public String saveImageToCloudinary(MultipartFile photo) {
        return uploadImageWithDetails(photo).getImageUrl();
    }

    /**
     * Xóa ảnh từ Cloudinary bằng publicId
     * @param publicId - ID của ảnh trên Cloudinary (ví dụ: phegon-ecommerce/abc123)
     */
    public void deleteImageFromCloudinary(String publicId) {
        try {
            Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));

            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted successfully from Cloudinary: {}", publicId);

        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể xóa ảnh từ Cloudinary: " + e.getMessage());
        }
    }
}
