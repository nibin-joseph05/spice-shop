// com.spiceshop.dto.OrderDetailsDto
package com.spiceshop.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDetailsDto {
    private Long id;
    private String orderNumber;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String orderStatus;
    private String paymentStatus;
    private String paymentMethod;
    private ShippingAddressDto shippingAddress;
    private List<OrderItemDetailsDto> items;

    public OrderDetailsDto() {}

    public OrderDetailsDto(Long id, String orderNumber, LocalDateTime orderDate, BigDecimal totalAmount, String orderStatus, String paymentStatus, String paymentMethod, ShippingAddressDto shippingAddress, List<OrderItemDetailsDto> items) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.shippingAddress = shippingAddress;
        this.items = items;

    }



    // Getters
    public Long getId() {
        return id;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public ShippingAddressDto getShippingAddress() {
        return shippingAddress;
    }

    public List<OrderItemDetailsDto> getItems() {
        return items;
    }

    // Nested DTO for Order Items
    public static class OrderItemDetailsDto {
        private String spiceName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private Integer packWeightInGrams;
        private String qualityClass;
        private String imageUrl;

        public OrderItemDetailsDto() {}

        public OrderItemDetailsDto(String spiceName, Integer quantity, BigDecimal unitPrice, Integer packWeightInGrams, String qualityClass, String imageUrl) {
            this.spiceName = spiceName;
            this.quantity = quantity;
            this.unitPrice = unitPrice;
            this.packWeightInGrams = packWeightInGrams;
            this.qualityClass = qualityClass;
            this.imageUrl = imageUrl;
        }

        // Getters
        public String getSpiceName() {
            return spiceName;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public Integer getPackWeightInGrams() {
            return packWeightInGrams;
        }

        public String getQualityClass() {
            return qualityClass;
        }

        public String getImageUrl() {
            return imageUrl;
        }
    }

    // Nested DTO for Shipping Address
    public static class ShippingAddressDto {
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phoneNumber;

        public ShippingAddressDto() {}

        public ShippingAddressDto(String addressLine1, String addressLine2, String city, String state, String postalCode, String country, String phoneNumber) {
            this.addressLine1 = addressLine1;
            this.addressLine2 = addressLine2;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.country = country;
            this.phoneNumber = phoneNumber;
        }

        // Getters
        public String getAddressLine1() {
            return addressLine1;
        }

        public String getAddressLine2() {
            return addressLine2;
        }

        public String getCity() {
            return city;
        }

        public String getState() {
            return state;
        }

        public String getPostalCode() {
            return postalCode;
        }

        public String getCountry() {
            return country;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }
    }
}