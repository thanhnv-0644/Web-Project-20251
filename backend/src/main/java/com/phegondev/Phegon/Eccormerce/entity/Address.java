package com.phegondev.Phegon.Eccormerce.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Objects;

@Data
@Entity
@Table(name = "addresses")
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "street", nullable = false)
    private String street; // Địa chỉ cụ thể (số nhà, tên đường)

    @Column(name = "ward", nullable = false)
    private String ward; // Phường

    @Column(name = "city", nullable = false)
    private String city; // Thành phố

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "created_at")
    private final LocalDateTime createdAt = LocalDateTime.now();

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !(o instanceof Address)) return false;
        Address address = (Address) o;
        return id.equals(address.id) &&
                Objects.equals(street, address.street) &&
                Objects.equals(ward, address.ward) &&
                Objects.equals(city, address.city) &&
                address.canEqual(this);
    }


    public boolean canEqual(Object other) {
        return other instanceof Address;
    }

}
