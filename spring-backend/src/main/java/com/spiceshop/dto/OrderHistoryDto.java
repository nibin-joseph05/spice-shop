// src/main/java/com/spiceshop/dto/OrderHistoryDto.java
package com.spiceshop.dto;

import com.spiceshop.models.Order; // Assuming you want to expose PaymentStatus and OrderStatus enums
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHistoryDto {
    private Long id;
    private String orderNumber;
    private LocalDateTime orderDate;
    private BigDecimal subtotal;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private Order.OrderStatus orderStatus;
    private Order.PaymentStatus paymentStatus;
    private String paymentMethod;
    private String shippingFirstName;
    private String shippingLastName;
    private String shippingAddressLine1;
    private String shippingAddressLine2;
    private String shippingCity;
    private String shippingState;
    private String shippingPinCode;
    private String shippingPhone;
    private String orderNotes;

    private List<OrderHistoryItemDto> items;
}