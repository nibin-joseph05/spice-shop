package com.spiceshop.repositorys;

import com.spiceshop.models.DeliveryAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAddressRepository extends JpaRepository<DeliveryAddress, Long> {
    // Find all addresses for a specific user
    List<DeliveryAddress> findByUserId(Long userId);

    // Find a specific address by ID and user ID to ensure ownership
    Optional<DeliveryAddress> findByIdAndUserId(Long id, Long userId);
}