package com.spiceshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private boolean success;
    private String message;
    private Long orderId;
    private String orderNumber;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String razorpayOrderId;
}