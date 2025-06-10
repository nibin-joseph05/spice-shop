package com.spiceshop.repositorys;

import com.spiceshop.models.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // No specific methods needed for now beyond basic CRUD
}