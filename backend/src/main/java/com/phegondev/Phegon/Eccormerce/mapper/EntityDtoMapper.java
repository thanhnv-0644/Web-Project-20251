package com.phegondev.Phegon.Eccormerce.mapper;

import com.phegondev.Phegon.Eccormerce.dto.*;
import com.phegondev.Phegon.Eccormerce.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {


    //user entity to user DTO

    public UserDto mapUserToDtoBasic(User user){
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setPhoneNumber(user.getPhoneNumber());
        userDto.setEmail(user.getEmail());
        userDto.setRole(user.getRole().name());
        userDto.setName(user.getName());
        return userDto;

    }

    //Address to DTO Basic
    public AddressDto mapAddressToDtoBasic(Address address){
        AddressDto addressDto = new AddressDto();
        addressDto.setId(address.getId());
        addressDto.setStreet(address.getStreet());
        addressDto.setWard(address.getWard());
        addressDto.setCity(address.getCity());
        return addressDto;
    }

    //Category to DTO basic
    public CategoryDto mapCategoryToDtoBasic(Category category){
        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setId(category.getId());
        categoryDto.setName(category.getName());
        return categoryDto;
    }


    //OrderItem to DTO Basics
    public OrderItemDto mapOrderItemToDtoBasic(OrderItem orderItem){
        OrderItemDto orderItemDto = new OrderItemDto();
        orderItemDto.setId(orderItem.getId());
        orderItemDto.setQuantity(orderItem.getQuantity());
        orderItemDto.setPrice(orderItem.getPrice());
        // Status không còn được map từ OrderItem, chỉ lấy từ Order
        orderItemDto.setCreatedAt(orderItem.getCreatedAt());
        
        // Thêm orderId để frontend biết order nào
        if (orderItem.getOrder() != null) {
            orderItemDto.setOrderId(orderItem.getOrder().getId());
        }
        
        return orderItemDto;
    }

    //Product to DTO Basic
    public ProductDto mapProductToDtoBasic(Product product){
        ProductDto productDto = new ProductDto();
        productDto.setId(product.getId());
        productDto.setName(product.getName());
        productDto.setDescription(product.getDescription());
        productDto.setPrice(product.getPrice());
        productDto.setImageUrl(product.getImageUrl());
        return productDto;
    }

    public UserDto mapUserToDtoPlusAddress(User user){

        System.out.println("mapUserToDtoPlusAddress is called");
        UserDto userDto = mapUserToDtoBasic(user);
        if (user.getAddress() != null){

            AddressDto addressDto = mapAddressToDtoBasic(user.getAddress());
            userDto.setAddress(addressDto);

        }
        return userDto;
    }


    //orderItem to DTO plus product
    public OrderItemDto mapOrderItemToDtoPlusProduct(OrderItem orderItem){
        OrderItemDto orderItemDto = mapOrderItemToDtoBasic(orderItem);

        if (orderItem.getProduct() != null) {
            ProductDto productDto = mapProductToDtoBasic(orderItem.getProduct());
            orderItemDto.setProduct(productDto);
        }
        return orderItemDto;
    }


    //OrderItem to DTO plus product and user
    public OrderItemDto mapOrderItemToDtoPlusProductAndUser(OrderItem orderItem){
        OrderItemDto orderItemDto = mapOrderItemToDtoPlusProduct(orderItem);

        // Lấy user từ order thay vì trực tiếp từ orderItem
        if (orderItem.getOrder() != null && orderItem.getOrder().getUser() != null){
            UserDto userDto = mapUserToDtoPlusAddress(orderItem.getOrder().getUser());
            orderItemDto.setUser(userDto);
        }
        return orderItemDto;
    }


    //USer to DTO with Address and Order Items History
    @Deprecated
    public UserDto mapUserToDtoPlusAddressAndOrderHistory(User user) {
        // Method deprecated: User không còn trực tiếp liên kết với OrderItem
        // Sử dụng OrderService.getMyOrders() để lấy order history
        return mapUserToDtoPlusAddress(user);
    }

    // Order to DTO Basic
    public OrderDto mapOrderToDtoBasic(Order order){
        OrderDto orderDto = new OrderDto();
        orderDto.setId(order.getId());
        orderDto.setTotalPrice(order.getTotalPrice());
        orderDto.setCreatedAt(order.getCreatedAt());
        orderDto.setStatus(order.getStatus() != null ? order.getStatus().name() : "PENDING");
        
        // Đếm số lượng items
        if (order.getOrderItemList() != null) {
            orderDto.setItemCount(order.getOrderItemList().size());
        }
        
        return orderDto;
    }

    // Order to DTO with Items
    public OrderDto mapOrderToDtoWithItems(Order order){
        OrderDto orderDto = mapOrderToDtoBasic(order);
        
        if (order.getOrderItemList() != null && !order.getOrderItemList().isEmpty()) {
            orderDto.setOrderItemList(order.getOrderItemList()
                    .stream()
                    .map(this::mapOrderItemToDtoPlusProduct)
                    .collect(Collectors.toList()));
        }
        
        return orderDto;
    }

    // Order to DTO with Items and User
    public OrderDto mapOrderToDtoWithItemsAndUser(Order order){
        OrderDto orderDto = mapOrderToDtoWithItems(order);
        
        if (order.getUser() != null) {
            orderDto.setUser(mapUserToDtoPlusAddress(order.getUser()));
        }
        
        return orderDto;
    }

}
