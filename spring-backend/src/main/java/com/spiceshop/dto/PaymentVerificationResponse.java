package com.spiceshop.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationResponse {
    private boolean success;
    private String message;
    private Long orderId;
    private String orderNumber;
    private String paymentStatus;
}