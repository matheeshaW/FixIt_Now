package com.fixitnow.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    /**
     * Find all reviews for a specific provider
     * @param providerId the ID of the provider
     * @return list of reviews for the provider
     */
    List<Review> findByProviderId(Long providerId);

    /**
     * Calculate the average rating for a specific provider
     * @param providerId the ID of the provider
     * @return the average rating as a Double
     */
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.providerId = :providerId")
    Double getAverageRating(@Param("providerId") Long providerId);

    /**
     * Find all reviews by a specific customer
     * @param customerId the ID of the customer
     * @return list of reviews by the customer
     */
    List<Review> findByCustomerId(Long customerId);

    /**
     * Find all reviews for a specific booking
     * @param bookingId the ID of the booking
     * @return list of reviews for the booking
     */
    List<Review> findByBookingId(Long bookingId);

    /**
     * Check if a review exists for a specific booking
     * @param bookingId the ID of the booking
     * @return true if review exists, false otherwise
     */
    boolean existsByBookingId(Long bookingId);
}