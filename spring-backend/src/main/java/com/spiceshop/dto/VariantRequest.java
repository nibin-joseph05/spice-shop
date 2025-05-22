// com.spiceshop.dto.VariantRequest.java
package com.spiceshop.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VariantRequest {
    private String qualityClass;
    private List<PackRequest> packs;
}