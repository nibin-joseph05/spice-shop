
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
public class OrderHistoryItemDto {
    private Long orderItemId;
    private String spiceName;
    private String qualityClass;
    private int packWeightInGrams;
    private BigDecimal unitPrice;
    private int quantity;
    private String imageUrl;
}