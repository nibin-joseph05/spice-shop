package com.spiceshop.services;

import com.spiceshop.models.User;
import com.spiceshop.models.DeliveryAddress;
import com.spiceshop.repositorys.DeliveryAddressRepository;
import com.spiceshop.repositorys.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final DeliveryAddressRepository deliveryAddressRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, DeliveryAddressRepository deliveryAddressRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.deliveryAddressRepository = deliveryAddressRepository;
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User createUser(String firstName, String lastName, String email, String password) {
        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setDisplayName(generateDisplayName(email));
        user.setPassword(passwordEncoder.encode(password));

        return userRepository.save(user);
    }

    private String generateDisplayName(String email) {
        return email.split("@")[0];
    }

    @Transactional
    public DeliveryAddress addDeliveryAddress(Long userId, DeliveryAddress address) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        address.setUser(user);
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());
        return deliveryAddressRepository.save(address);
    }

    // Update an existing delivery address for a user
    @Transactional
    public DeliveryAddress updateDeliveryAddress(Long addressId, Long userId, DeliveryAddress updatedAddress) {
        DeliveryAddress existingAddress = deliveryAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Delivery address not found or does not belong to user."));

        // Update fields (ensure you don't overwrite ID or user relationship)
        existingAddress.setFirstName(updatedAddress.getFirstName());
        existingAddress.setLastName(updatedAddress.getLastName());
        existingAddress.setAddressLine1(updatedAddress.getAddressLine1());
        existingAddress.setAddressLine2(updatedAddress.getAddressLine2());
        existingAddress.setCity(updatedAddress.getCity());
        existingAddress.setState(updatedAddress.getState());
        existingAddress.setPinCode(updatedAddress.getPinCode());
        existingAddress.setPhone(updatedAddress.getPhone());
        existingAddress.setNote(updatedAddress.getNote());
        existingAddress.setBillingSameAsShipping(updatedAddress.isBillingSameAsShipping());
        existingAddress.setUpdatedAt(LocalDateTime.now());

        return deliveryAddressRepository.save(existingAddress);
    }

    // Get all delivery addresses for a specific user
    @Transactional(readOnly = true)
    public List<DeliveryAddress> getAllAddressesForUser(Long userId) {
        return deliveryAddressRepository.findByUserId(userId);
    }

    // Get a specific delivery address by its ID and user ID
    @Transactional(readOnly = true)
    public Optional<DeliveryAddress> getAddressByIdForUser(Long addressId, Long userId) {
        return deliveryAddressRepository.findByIdAndUserId(addressId, userId);
    }

    // Delete a delivery address for a specific user
    @Transactional
    public void deleteDeliveryAddress(Long addressId, Long userId) {
        // Ensure the address belongs to the user before deleting
        DeliveryAddress addressToDelete = deliveryAddressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Delivery address not found or does not belong to user."));
        deliveryAddressRepository.delete(addressToDelete);
    }

}
