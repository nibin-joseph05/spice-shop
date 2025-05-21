// com.spiceshop.controllers.SpiceController.java
package com.spiceshop.controllers;

import com.spiceshop.dto.*;
import com.spiceshop.models.*;
import com.spiceshop.services.SpiceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${FRONTEND_URL}")
public class SpiceController {

    @Autowired
    private SpiceService spiceService;

    private final Path uploadDir = Paths.get("uploads/spices").toAbsolutePath().normalize();

    @PostMapping("/spices")
    public ResponseEntity<SpiceDto> createSpice(
            @RequestPart("spice") String spiceJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files
    ) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        SpiceRequest req = mapper.readValue(spiceJson, SpiceRequest.class);

        Spice entity = new Spice();
        entity.setName(req.getName());
        entity.setUnit(req.getUnit());
        entity.setDescription(req.getDescription());
        entity.setOrigin(req.getOrigin());
        entity.setAvailable(req.getIsAvailable());

        // map variants
        if (req.getVariants() != null) {
            req.getVariants().forEach(vr -> {
                SpiceVariant sv = new SpiceVariant();
                sv.setQualityClass(vr.getQualityClass());
                sv.setPrice(vr.getPrice());
                entity.getVariants().add(sv);
            });
        }

        // map JSON URLs
        if (req.getImageUrls() != null) {
            req.getImageUrls().forEach(url -> {
                SpiceImage si = new SpiceImage();
                si.setImageUrl(url);
                entity.getImages().add(si);
            });
        }

        Spice saved = spiceService.createSpice(entity);
        SpiceDto dto = spiceService.toDto(saved);
        return ResponseEntity.ok(dto);
    }


    @GetMapping("/spices")
    public ResponseEntity<List<SpiceDto>> getAllSpices() {
        List<Spice> spices = spiceService.getAllSpices();
        List<SpiceDto> dtos = spices.stream()
                .map(spiceService::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/spices/{id}")
    public ResponseEntity<?> deleteSpice(@PathVariable Long id) {
        try {
            spiceService.deleteSpice(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Spice not found with id: " + id));
        }
    }

    // PATCH endpoint for availability
    @PatchMapping("/spices/{id}/availability")
    public ResponseEntity<SpiceDto> updateAvailability(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            Spice updated = spiceService.updateAvailability(id, request.get("available"));
            return ResponseEntity.ok(spiceService.toDto(updated));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        }
    }


    @GetMapping("/products")
    public ResponseEntity<Map<String, Object>> getProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) List<String> origin,
            @RequestParam(required = false) List<String> qualityClass,
            @RequestParam(required = false) Boolean inStock) {

        Page<Spice> spicePage = spiceService.getFilteredSpices(
                page, limit, search, minPrice, maxPrice, origin, qualityClass, inStock
        );

        List<SpiceDto> dtos = spicePage.getContent()
                .stream()
                .map(spiceService::toDto)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("products", dtos);
        response.put("totalPages", spicePage.getTotalPages());

        return ResponseEntity.ok(response);
    }



}
