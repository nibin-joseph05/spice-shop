package com.spiceshop.services;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.spiceshop.dto.PaymentVerificationRequest;
import com.spiceshop.dto.PaymentVerificationResponse;
import com.spiceshop.exceptions.CustomException;
import com.spiceshop.models.Order;
import com.spiceshop.models.OrderItem;
import com.spiceshop.models.Payment;
import com.spiceshop.models.SpicePack;
import com.spiceshop.repositorys.OrderRepository;
import com.spiceshop.repositorys.PaymentRepository;
import com.spiceshop.repositorys.CartRepository;
import com.spiceshop.repositorys.SpicePackRepository;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final CartRepository cartRepository;
    private final SpicePackRepository spicePackRepository;

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    public PaymentService(OrderRepository orderRepository, PaymentRepository paymentRepository,
                          CartRepository cartRepository, SpicePackRepository spicePackRepository) {
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.cartRepository = cartRepository;
        this.spicePackRepository = spicePackRepository; // Initialize SpicePackRepository
    }

    @Transactional
    public PaymentVerificationResponse verifyRazorpayPayment(PaymentVerificationRequest request) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());

            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new CustomException("Order not found with ID: " + request.getOrderId()));

            Payment payment = paymentRepository.findByGatewayOrderId(request.getRazorpayOrderId())
                    .orElseThrow(() -> new CustomException("Payment record not found for Razorpay Order ID: " + request.getRazorpayOrderId()));

            boolean isVerified = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (isVerified) {
                // Payment successful
                payment.setStatus(Order.PaymentStatus.COMPLETED);
                payment.setTransactionId(request.getRazorpayPaymentId()); // Store payment ID
                payment.setPaymentDate(LocalDateTime.now());
                paymentRepository.save(payment);

                order.setPaymentStatus(Order.PaymentStatus.COMPLETED);
                order.setOrderStatus(Order.OrderStatus.PROCESSING); // Order moves to processing after payment
                order.setPaymentDate(LocalDateTime.now()); // Set payment date on order
                orderRepository.save(order);

                // --- CRITICAL CHANGE: Reduce stock and clear cart ONLY on successful payment verification ---
                for (OrderItem item : order.getItems()) {
                    SpicePack pack = item.getSpicePack();
                    if (pack.getStockQuantity() < item.getQuantity()) {
                        // This should ideally not happen if initial stock check was good, but good to double check
                        throw new CustomException("Insufficient stock for " + item.getSpiceName() + " during payment verification.");
                    }
                    pack.setStockQuantity(pack.getStockQuantity() - item.getQuantity());
                    spicePackRepository.save(pack);
                }
                // Clear the user's cart after successful order placement and payment
                cartRepository.findByUser(order.getUser()).ifPresent(cartRepository::delete);
                // --- END CRITICAL CHANGE ---

                return PaymentVerificationResponse.builder()
                        .orderId(order.getId())
                        .orderNumber(order.getOrderNumber())
                        .paymentStatus(Order.PaymentStatus.COMPLETED.name())
                        .message("Payment successfully verified and order is being processed.")
                        .success(true)
                        .build();

            } else {
                // Payment verification failed
                payment.setStatus(Order.PaymentStatus.FAILED);
                payment.setFailureReason("Signature verification failed.");
                paymentRepository.save(payment);

                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setOrderStatus(Order.OrderStatus.CANCELLED); // Order is cancelled if payment fails
                orderRepository.save(order);

                // Stock is NOT reduced, cart is NOT cleared
                throw new CustomException("Payment verification failed. Please try again or contact support.");
            }

        } catch (RazorpayException e) {
            System.err.println("Razorpay exception during payment verification: " + e.getMessage());
            throw new CustomException("Error verifying payment with Razorpay: " + e.getMessage());
        } catch (CustomException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Unexpected error during payment verification: " + e.getMessage());
            throw new CustomException("An unexpected error occurred during payment verification.");
        }
    }
}