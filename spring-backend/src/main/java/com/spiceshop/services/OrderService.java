package com.spiceshop.services;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.spiceshop.dto.OrderRequest;
import com.spiceshop.dto.OrderResponse;
import com.spiceshop.exceptions.CustomException;
import com.spiceshop.models.*;
import com.spiceshop.repositorys.*;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final SpicePackRepository spicePackRepository;

    @Value("${razorpay.key_id}")
    private String razorpayKeyId;

    @Value("${razorpay.key_secret}")
    private String razorpayKeySecret;

    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);


    public OrderService(OrderRepository orderRepository, OrderItemRepository orderItemRepository,
                        PaymentRepository paymentRepository, UserRepository userRepository,
                        CartRepository cartRepository, SpicePackRepository spicePackRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.spicePackRepository = spicePackRepository;
    }

    @Transactional
    public OrderResponse placeOrder(OrderRequest orderRequest, User currentUser) throws RazorpayException {
        logger.info("OrderService: Attempting to place order.");
        if (currentUser == null) {
            logger.error("OrderService: currentUser is null. Cannot place order for unauthenticated user.");
            throw new CustomException("User not authenticated.");
        }
        logger.info("OrderService: Authenticated user: {}", currentUser.getEmail());

        Cart userCart = cartRepository.findByUser(currentUser)
                .orElseThrow(() -> new CustomException("Your cart is empty. Please add items before placing an order."));

        if (userCart.getItems().isEmpty()) {
            throw new CustomException("Your cart is empty. Please add items before placing an order.");
        }

        Order order = new Order();
        order.setUser(currentUser);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        // Initial status is PENDING for all orders until further processing
        order.setOrderStatus(Order.OrderStatus.PENDING);
        order.setPaymentMethod(Order.PaymentMethod.valueOf(orderRequest.getPaymentMethod().toUpperCase()));
        order.setShippingNote(orderRequest.getOrderNotes());

        order.setShippingFirstName(orderRequest.getShippingAddress().getFirstName());
        order.setShippingLastName(orderRequest.getShippingAddress().getLastName());
        order.setShippingAddressLine1(orderRequest.getShippingAddress().getAddressLine1());
        order.setShippingAddressLine2(orderRequest.getShippingAddress().getAddressLine2());
        order.setShippingCity(orderRequest.getShippingAddress().getCity());
        order.setShippingState(orderRequest.getShippingAddress().getState());
        order.setShippingPinCode(orderRequest.getShippingAddress().getPinCode());
        order.setShippingPhone(orderRequest.getShippingAddress().getPhone());

        List<OrderItem> orderItems = userCart.getItems().stream().map(cartItem -> {
            SpicePack spicePack = spicePackRepository.findById(cartItem.getSpicePack().getId())
                    .orElseThrow(() -> new CustomException("Product not found: " + cartItem.getSpicePack().getId()));

            if (cartItem.getQuantity() > spicePack.getStockQuantity()) {
                throw new CustomException("Insufficient stock for " + spicePack.getVariant().getSpice().getName() + " (" + spicePack.getPackWeightInGrams() + "g). Available: " + spicePack.getStockQuantity());
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .spicePack(spicePack)
                    .spiceName(spicePack.getVariant().getSpice().getName())
                    .qualityClass(spicePack.getVariant().getQualityClass())
                    .packWeightInGrams(spicePack.getPackWeightInGrams())
                    .unitPrice(spicePack.getPrice())
                    .quantity(cartItem.getQuantity())
                    .build();
            return orderItem;
        }).collect(Collectors.toList());

        order.setItems(orderItems);
        order.calculateTotals(); // Calculate subtotal based on items

        // Calculate shipping cost conditionally
        if (order.getSubtotal().compareTo(new BigDecimal("500")) >= 0) {
            order.setShippingCost(BigDecimal.ZERO); // Free shipping if subtotal is 500 or more
        } else {
            order.setShippingCost(BigDecimal.valueOf(50.00)); // Otherwise, 50
        }
        order.calculateTotals(); // Recalculate total after setting shipping cost

        String razorpayOrderId = null;

        if (order.getPaymentMethod() == Order.PaymentMethod.COD) {
            // For COD, the order is considered "placed" immediately.
            // Stock is reduced and cart cleared here.
            if (order.getTotal().compareTo(new BigDecimal("5000")) > 0) {
                throw new CustomException("Cash on Delivery not available for orders over ₹5000.");
            }
            order.setPaymentStatus(Order.PaymentStatus.PENDING); // Payment is pending on delivery
            order.setOrderStatus(Order.OrderStatus.PROCESSING); // Order is immediately processing

            // Reduce stock
            for (OrderItem item : orderItems) {
                SpicePack pack = item.getSpicePack();
                pack.setStockQuantity(pack.getStockQuantity() - item.getQuantity());
                spicePackRepository.save(pack);
            }
            // Clear cart
            cartRepository.delete(userCart);

        } else if (order.getPaymentMethod() == Order.PaymentMethod.RAZORPAY) {
            // For Razorpay, order is pending until payment is confirmed.
            // Stock reduction and cart clearing happen ONLY AFTER successful payment verification.
            order.setPaymentStatus(Order.PaymentStatus.PENDING); // Payment is pending gateway interaction
            order.setOrderStatus(Order.OrderStatus.PENDING); // Order status remains pending payment

            try {
                RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
                JSONObject orderRequestJson = new JSONObject();
                orderRequestJson.put("amount", order.getTotal().multiply(new BigDecimal("100")).intValue());
                orderRequestJson.put("currency", "INR");
                orderRequestJson.put("receipt", order.getOrderNumber());
                JSONObject notes = new JSONObject();
                notes.put("order_id", order.getId());
                orderRequestJson.put("notes", notes);

                com.razorpay.Order razorpayOrder = razorpay.orders.create(orderRequestJson);
                razorpayOrderId = razorpayOrder.get("id");
                order.setRazorpayOrderId(razorpayOrderId);

            } catch (RazorpayException e) {
                logger.error("Razorpay exception while creating order: {}", e.getMessage(), e);
                // If Razorpay order creation fails, set order/payment status to failed immediately
                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setOrderStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order); // Save updated status
                throw new CustomException("Failed to initiate Razorpay payment. Please try again later.");
            }
        }

        orderRepository.save(order); // Save the order with its determined initial status

        Payment payment = Payment.builder()
                .order(order)
                .paymentMethod(order.getPaymentMethod())
                .amount(order.getTotal())
                .status(order.getPaymentStatus()) // Will be PENDING for both COD & RAZORPAY at this stage
                .paymentDate(LocalDateTime.now()) // Set current time, will be updated on completion/failure
                .gatewayOrderId(razorpayOrderId) // Will be null for COD
                .build();
        paymentRepository.save(payment);
        order.getPayments().add(payment); // Ensure the payment is linked to the order entity

        // Re-save order after linking payment
        orderRepository.save(order);

        return OrderResponse.builder()
                .orderId(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotal())
                .paymentMethod(order.getPaymentMethod().name())
                .razorpayOrderId(razorpayOrderId)
                .message("Order placed successfully. Proceeding to payment.")
                .success(true)
                .build();
    }
}