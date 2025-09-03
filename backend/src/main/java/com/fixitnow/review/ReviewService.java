package com.fixitnow.review;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;

    /**
     * Submit a new review
     * @param review the review to save
     * @return the saved review
     * @throws IllegalArgumentException if review data is invalid
     */
    public Review submitReview(Review review) {
        log.info("Submitting review for provider {} by customer {} for booking {}", 
                review.getProviderId(), review.getCustomerId(), review.getBookingId());

        // Validate review data
        validateReview(review);

        // Check if review already exists for this booking
        if (reviewRepository.existsByBookingId(review.getBookingId())) {
            throw new IllegalArgumentException("Review already exists for booking ID: " + review.getBookingId());
        }

        Review savedReview = reviewRepository.save(review);
        log.info("Review submitted successfully with ID: {}", savedReview.getId());

        return savedReview;
    }

    /**
     * Get all reviews for a specific provider
     * @param providerId the ID of the provider
     * @return list of reviews for the provider
     * @throws IllegalArgumentException if providerId is invalid
     */
    @Transactional(readOnly = true)
    public List<Review> getReviewsByProvider(Long providerId) {
        log.info("Fetching reviews for provider: {}", providerId);

        if (providerId == null || providerId <= 0) {
            throw new IllegalArgumentException("Provider ID must be a positive number");
        }

        List<Review> reviews = reviewRepository.findByProviderId(providerId);
        log.info("Found {} reviews for provider {}", reviews.size(), providerId);

        return reviews;
    }

    /**
     * Get the average rating for a specific provider
     * @param providerId the ID of the provider
     * @return the average rating
     * @throws IllegalArgumentException if providerId is invalid
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(Long providerId) {
        log.info("Calculating average rating for provider: {}", providerId);

        if (providerId == null || providerId <= 0) {
            throw new IllegalArgumentException("Provider ID must be a positive number");
        }

        Double averageRating = reviewRepository.getAverageRating(providerId);

        // If no reviews exist, return 0.0
        if (averageRating == null) {
            averageRating = 0.0;
        }

        log.info("Provider {} has average rating: {}", providerId, averageRating);

        return Math.round(averageRating * 100.0) / 100.0; // Round to 2 decimal places
    }

    /**
     * Get all reviews by a specific customer
     * @param customerId the ID of the customer
     * @return list of reviews by the customer
     * @throws IllegalArgumentException if customerId is invalid
     */
    @Transactional(readOnly = true)
    public List<Review> getReviewsByCustomer(Long customerId) {
        log.info("Fetching reviews by customer: {}", customerId);

        if (customerId == null || customerId <= 0) {
            throw new IllegalArgumentException("Customer ID must be a positive number");
        }

        List<Review> reviews = reviewRepository.findByCustomerId(customerId);
        log.info("Found {} reviews by customer {}", reviews.size(), customerId);

        return reviews;
    }

    /**
     * Validate review data
     * @param review the review to validate
     * @throws IllegalArgumentException if review data is invalid
     */
    private void validateReview(Review review) {
        if (review == null) {
            throw new IllegalArgumentException("Review cannot be null");
        }

        if (review.getBookingId() == null || review.getBookingId() <= 0) {
            throw new IllegalArgumentException("Booking ID must be a positive number");
        }

        if (review.getCustomerId() == null || review.getCustomerId() <= 0) {
            throw new IllegalArgumentException("Customer ID must be a positive number");
        }

        if (review.getProviderId() == null || review.getProviderId() <= 0) {
            throw new IllegalArgumentException("Provider ID must be a positive number");
        }

        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        if (review.getComment() == null || review.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Comment must not be blank");
        }

        if (review.getComment().length() > 500) {
            throw new IllegalArgumentException("Comment cannot exceed 500 characters");
        }
    }
}