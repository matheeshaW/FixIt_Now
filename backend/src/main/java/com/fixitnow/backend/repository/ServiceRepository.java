package com.fixitnow.backend.repository;

import com.fixitnow.backend.model.Service;
import com.fixitnow.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    // Find all services by a specific provider
    List<Service> findByProvider(User provider);
    
    // Find all services by provider ID
    List<Service> findByProviderUserId(Long providerId);
    
    // Find all services by category
    List<Service> findByCategoryCategoryId(Long categoryId);
    
    // Find all services by category name
    List<Service> findByCategoryCategoryName(String categoryName);
    
    // Find services by availability status
    List<Service> findByAvailabilityStatus(Service.AvailabilityStatus status);
    
    // Find services by price range
    List<Service> findByPriceBetween(java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice);
    
    // Find services by provider and availability status
    List<Service> findByProviderAndAvailabilityStatus(User provider, Service.AvailabilityStatus status);
    
    // Find services by provider ID and availability status
    List<Service> findByProviderUserIdAndAvailabilityStatus(Long providerId, Service.AvailabilityStatus status);
    
    // Search services by title or description
    List<Service> findByServiceTitleContainingOrServiceDescriptionContaining(String searchTerm, String searchTerm2);
    
    // Find services by provider ordered by creation date
    List<Service> findByProviderOrderByCreatedAtDesc(User provider);
    
    // Count services by provider
    long countByProvider(User provider);
    
    // Count services by provider and status
    long countByProviderAndAvailabilityStatus(User provider, Service.AvailabilityStatus status);
    
    // Find service by ID and provider (for security - ensure provider can only access their own services)
    Optional<Service> findByServiceIdAndProvider(Long serviceId, User provider);
    
    // Check if service exists by ID and provider
    boolean existsByServiceIdAndProvider(Long serviceId, User provider);
}
