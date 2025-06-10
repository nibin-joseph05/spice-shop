package com.spiceshop.controllers;

import com.spiceshop.dto.PaymentVerificationRequest;
import com.spiceshop.dto.ApiResponse;
import com.spiceshop.dto.PaymentVerificationResponse;
import com.spiceshop.exceptions.CustomException;
import com.spiceshop.services.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentVerificationResponse>> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            PaymentVerificationResponse response = paymentService.verifyRazorpayPayment(request);
            return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("An unexpected error occurred during payment verification."));
        }
    }
}