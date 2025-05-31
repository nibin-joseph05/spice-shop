package com.spiceshop.services;

import com.spiceshop.dto.AddToCartRequest;
import com.spiceshop.dto.CartDTO;
import com.spiceshop.dto.CartItemDTO;
import com.spiceshop.dto.UpdateCartItemRequest;
import com.spiceshop.exceptions.NotFoundException;
import com.spiceshop.models.*;
import com.spiceshop.repositorys.CartItemRepository;
import com.spiceshop.repositorys.CartRepository;
import com.spiceshop.repositorys.SpicePackRepository;
import com.spiceshop.repositorys.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.spiceshop.exceptions.InsufficientStockException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final SpicePackRepository spicePackRepository;
    private final UserRepository userRepository;

    @Autowired
    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       SpicePackRepository spicePackRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.spicePackRepository = spicePackRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setSubtotal(BigDecimal.ZERO);
                    newCart.setShippingCost(BigDecimal.valueOf(50));
                    newCart.setTotal(BigDecimal.ZERO);
                    return cartRepository.save(newCart);
                });
    }

    @Transactional
    public CartItem addItemToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        SpicePack spicePack = spicePackRepository.findById(request.getSpicePackId())
                .orElseThrow(() -> new NotFoundException("Spice pack not found"));

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartAndSpicePack(cart, spicePack);

        if (existingItem.isPresent()) {
            // Update quantity if exists
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
            recalculateCartTotals(cart);
            return item;
        } else {
            // Create new cart item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setSpicePack(spicePack);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
            cart.getItems().add(newItem);
            recalculateCartTotals(cart);
            return newItem;
        }
    }

    @Transactional
    public void updateCartItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));


        if (!item.getCart().getId().equals(cart.getId())) {
            throw new SecurityException("Cart item does not belong to user");
        }

        SpicePack spicePack = item.getSpicePack();
        int newDesiredQuantity = request.getQuantity();


        if (newDesiredQuantity < 1) {
            removeItemFromCart(userId, itemId);
            return;
        }
        if (newDesiredQuantity > spicePack.getStockQuantity()) {
            throw new InsufficientStockException("Not enough stock available for " + spicePack.getVariant().getSpice().getName() +
                    " (" + spicePack.getPackWeightInGrams() + "g). Max available: " + spicePack.getStockQuantity());
        }

        // Proceed with updating if stock is sufficient
        item.setQuantity(newDesiredQuantity);
        cartItemRepository.save(item);
        recalculateCartTotals(cart);
    }

    @Transactional
    public void removeItemFromCart(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new NotFoundException("Cart item not found"));

        // Verify item belongs to user's cart
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new SecurityException("Cart item does not belong to user");
        }

        cartItemRepository.delete(item);
        cart.getItems().remove(item);
        recalculateCartTotals(cart);
    }

    @Transactional
    public CartDTO getCartDetails(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return convertToDTO(cart);
    }

    private void recalculateCartTotals(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setSubtotal(subtotal);

        // Free shipping for orders above 500
        BigDecimal shippingCost = subtotal.compareTo(BigDecimal.valueOf(500)) >= 0 ?
                BigDecimal.ZERO : BigDecimal.valueOf(50);

        cart.setShippingCost(shippingCost);
        cart.setTotal(subtotal.add(shippingCost));

        cartRepository.save(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setSubtotal(cart.getSubtotal());
        dto.setShippingCost(cart.getShippingCost());
        dto.setTotal(cart.getTotal());

        List<CartItemDTO> itemDTOs = cart.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        dto.setItems(itemDTOs);
        return dto;
    }

    private CartItemDTO convertItemToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        SpicePack spicePack = item.getSpicePack();
        SpiceVariant variant = spicePack.getVariant();
        Spice spice = variant != null ? variant.getSpice() : null;

        dto.setId(item.getId());
        dto.setSpicePackId(spicePack.getId());

        if (spice != null) {
            dto.setSpiceName(spice.getName());

            // Get first image as thumbnail
            if (!spice.getImages().isEmpty()) {
                SpiceImage firstImage = spice.getImages().get(0);
                dto.setImageUrl(firstImage.getImageUrl());
            }
        }

        if (variant != null) {
            dto.setQualityClass(variant.getQualityClass());
        }

        dto.setPackWeightInGrams(spicePack.getPackWeightInGrams());
        dto.setPrice(spicePack.getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setTotalPrice(item.getTotalPrice());

        return dto;
    }


    @Transactional(readOnly = true)
    public int getCartItemCount(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cart.getItems().size();
    }
}