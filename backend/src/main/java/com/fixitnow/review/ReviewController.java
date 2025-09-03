package com.fixitnow.review;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/reviews")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Submit a new review
     * POST /api/reviews
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> submitReview(@Valid @RequestBody Review review) {
        try {
            log.info("Received review submission request: {}", review);

            Review savedReview = reviewService.submitReview(review);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Review submitted successfully");
            response.put("data", savedReview);
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid review submission: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error submitting review", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to submit review. Please try again.");
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all reviews for a specific provider
     * GET /api/reviews/provider/{providerId}
     */
   /* @GetMapping("/provider/{providerId}")
    public ResponseEntity<Map<String, Object>> getReviewsByProvider(@PathVariable Long providerId) {
        try {
            log.info("Fetching reviews for provider: {}", providerId);

            List<Review> reviews = reviewService.getReviewsByProvider(providerId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);
            response.put("count", reviews.size());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid provider ID: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error fetching reviews for provider {}", providerId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch reviews. Please try again.");
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }*/
       @GetMapping("/")
    public List<String> getReviews() {
        // temporary test
        return List.of("Review 1", "Review 2");
    }

    /**
     * Get the average rating for a specific provider
     * GET /api/reviews/average/{providerId}
     */
    @GetMapping("/average/{providerId}")
    public ResponseEntity<Map<String, Object>> getAverageRating(@PathVariable Long providerId) {
        try {
            log.info("Fetching average rating for provider: {}", providerId);

            Double averageRating = reviewService.getAverageRating(providerId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("providerId", providerId);
            response.put("averageRating", averageRating);
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid provider ID: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error fetching average rating for provider {}", providerId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch average rating. Please try again.");
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all reviews by a specific customer
     * GET /api/reviews/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<Map<String, Object>> getReviewsByCustomer(@PathVariable Long customerId) {
        try {
            log.info("Fetching reviews by customer: {}", customerId);

            List<Review> reviews = reviewService.getReviewsByCustomer(customerId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", reviews);
            response.put("count", reviews.size());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("Invalid customer ID: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);

        } catch (Exception e) {
            log.error("Error fetching reviews by customer {}", customerId, e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to fetch customer reviews. Please try again.");
            response.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}