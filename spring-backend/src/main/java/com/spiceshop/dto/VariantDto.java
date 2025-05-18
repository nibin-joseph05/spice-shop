// com.spiceshop.dto.VariantDto.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VariantDto {
    private Long id;
    private String qualityClass;
    private BigDecimal price;
}