// com.spiceshop.dto.VariantDto.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VariantDto {
    private Long id;
    private String qualityClass;
    private List<PackDto> packs;
}