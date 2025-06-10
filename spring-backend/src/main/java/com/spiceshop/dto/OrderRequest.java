package com.spiceshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    private Long userId; // For internal use, can be removed if user is from session
    private List<CartItemDto> cartItems; // Renamed for clarity, map to OrderItems on backend
    private AddressDto shippingAddress;
    private String paymentMethod; // "razorpay" or "cod"
    private String orderNotes;
    private BigDecimal totalAmount; // For frontend display, backend recalculates for security

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItemDto {
        private Long spiceId; // Renamed to match the field on the client-side
        private Integer quantity;
        private Integer packWeightInGrams;
        private BigDecimal price; // unit price at the time of adding to cart
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressDto {
        private String firstName;
        private String lastName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String pinCode;
        private String phone;
    }
}