package com.spiceshop.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    public enum OrderStatus {
        PENDING,       // Order placed but payment not confirmed
        PROCESSING,    // Payment confirmed, preparing for shipment
        SHIPPED,       // Order shipped to customer
        DELIVERED,     // Order delivered to customer
        CANCELLED,     // Order cancelled
        REFUNDED       // Order refunded
    }

    public enum PaymentStatus {
        PENDING,       // Payment initiated but not completed
        COMPLETED,     // Payment successfully processed
        FAILED,        // Payment failed
        REFUNDED,      // Payment refunded
        PARTIALLY_REFUNDED
    }

    public enum PaymentMethod {
        CREDIT_CARD,
        DEBIT_CARD,
        PAYPAL,
        UPI,
        NET_BANKING,
        COD
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(unique = true)
    private String orderNumber;  // Unique order identifier (e.g., ORD-20230606-0001)

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @NotNull
    private BigDecimal subtotal;

    @NotNull
    private BigDecimal shippingCost;

    @NotNull
    private BigDecimal total;

    @NotNull
    @Enumerated(EnumType.STRING)
    private OrderStatus orderStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @NotNull
    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private String transactionId;  // Payment gateway transaction ID

    // Shipping address snapshot at time of order
    @NotBlank
    private String shippingFirstName;

    @NotBlank
    private String shippingLastName;

    @NotBlank
    private String shippingAddressLine1;

    private String shippingAddressLine2;

    @NotBlank
    private String shippingCity;

    @NotBlank
    private String shippingState;

    @NotBlank
    private String shippingPinCode;

    @NotBlank
    private String shippingPhone;

    private String shippingNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Audit fields
    private LocalDateTime paymentDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private LocalDateTime cancelledDate;

    // Helper method to calculate totals
    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        this.total = subtotal.add(shippingCost);
    }
}