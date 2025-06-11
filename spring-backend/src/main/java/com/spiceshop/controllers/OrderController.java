package com.spiceshop.controllers;

import com.razorpay.RazorpayException;
import com.spiceshop.dto.*;
import com.spiceshop.exceptions.CustomException;
import com.spiceshop.models.User;
import com.spiceshop.repositorys.UserRepository;
import com.spiceshop.services.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;

import java.util.List;


@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    public OrderController(OrderService orderService, UserRepository userRepository) {
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @PostMapping("/place")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@RequestBody OrderRequest orderRequest,
                                                                 HttpSession session) { // Change parameter to HttpSession

        User currentUser = null;
        Object userId = session.getAttribute("userId"); // Manually get userId from session

        if (userId != null) {
            currentUser = userRepository.findById((Long) userId) // Fetch the User entity from the database
                    .orElse(null);
            if (currentUser != null) {
                logger.info("OrderController: Received request for user: {}", currentUser.getEmail());
            } else {
                logger.warn("OrderController: User ID found in session ({}), but User entity not found in DB.", userId);
                // Optionally invalidate session if user not found in DB for the ID in session
                session.invalidate();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User session invalid. Please log in again."));
            }
        } else {
            logger.warn("OrderController: No userId found in session for placeOrder request. User not authenticated.");
            // Return unauthorized response if no user is in session
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not authenticated. Please log in."));
        }

        try {
            OrderResponse response = orderService.placeOrder(orderRequest, currentUser);
            return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
        } catch (CustomException e) {
            logger.error("OrderController: CustomException during placeOrder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (RazorpayException e) {
            logger.error("OrderController: RazorpayException during placeOrder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("Payment initiation failed: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("OrderController: Unexpected error during placeOrder: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("An unexpected error occurred while placing the order."));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<OrderHistoryDto>>> getUserOrders(HttpSession session) {
        User currentUser = null;
        Object userId = session.getAttribute("userId");

        if (userId != null) {
            currentUser = userRepository.findById((Long) userId)
                    .orElse(null);
            if (currentUser == null) {
                session.invalidate();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User session invalid. Please log in again."));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not authenticated. Please log in."));
        }

        try {
            List<OrderHistoryDto> orders = orderService.getUserOrderHistory(currentUser);
            return ResponseEntity.ok(ApiResponse.success("User order history fetched successfully.", orders));
        } catch (CustomException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("OrderController: Unexpected error fetching order history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("An unexpected error occurred while fetching order history."));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDetailsDto>> getOrderDetails(@PathVariable Long orderId, HttpSession session) {
        User currentUser = null;
        Object userId = session.getAttribute("userId");

        if (userId != null) {
            currentUser = userRepository.findById((Long) userId)
                    .orElse(null);
            if (currentUser == null) {
                session.invalidate();
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User session invalid. Please log in again."));
            }
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("User not authenticated. Please log in."));
        }

        try {
            OrderDetailsDto orderDetails = orderService.getOrderDetailByIdAndUser(orderId, currentUser);
            return ResponseEntity.ok(ApiResponse.success("Order details fetched successfully.", orderDetails));
        } catch (CustomException e) {
            logger.error("OrderController: CustomException fetching order details: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("OrderController: Unexpected error fetching order details: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiResponse.error("An unexpected error occurred while fetching order details."));
        }
    }
}