// com.spiceshop.controllers.SpiceController.java
package com.spiceshop.controllers;

import com.spiceshop.dto.*;
import com.spiceshop.models.*;
import com.spiceshop.services.SpiceService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;


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

        // handle file uploads
        if (files != null) {
            Files.createDirectories(uploadDir);
            for (MultipartFile f : files) {
                String url = storeFile(f);
                SpiceImage si = new SpiceImage();
                si.setImageUrl(url);
                entity.getImages().add(si);
            }
        }

        Spice saved = spiceService.createSpice(entity);
        SpiceDto dto = spiceService.toDto(saved);
        return ResponseEntity.ok(dto);
    }

    private String storeFile(MultipartFile file) {
        try {
            // clean filename
            String original = StringUtils.cleanPath(file.getOriginalFilename());
            String filename = System.currentTimeMillis() + "-" + original;

            // target location
            Path target = uploadDir.resolve(filename);
            // copy file
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            // return the URL path under which Spring can serve it
            return "/uploads/spices/" + filename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + file.getOriginalFilename(), ex);
        }
    }
}
