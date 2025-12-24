package com.phegondev.Phegon.Eccormerce.dto;


import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDto {

    private Long id;
    private int quantity;
    private BigDecimal price;
    private  UserDto user;
    private ProductDto product;
    private LocalDateTime createdAt;
    private Long orderId; // Thêm orderId để frontend biết order nào
}
