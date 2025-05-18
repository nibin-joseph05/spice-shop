// com.spiceshop.dto.VariantRequest.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantRequest {
    private String qualityClass;
    private BigDecimal price;
}