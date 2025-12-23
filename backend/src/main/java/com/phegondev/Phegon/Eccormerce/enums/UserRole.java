package com.phegondev.Phegon.Eccormerce.enums;

public enum UserRole {
    ADMIN(0),
    USER(1);

    private final int value;

    UserRole(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}