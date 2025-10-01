package com.fixitnow.backend.controller;

import com.fixitnow.backend.model.Review;
import com.fixitnow.backend.service.ReviewService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody AddReviewRequest request) {
        try {
            Review review = reviewService.addReview(
                    request.getBookingId(),
                    request.getCustomerId(),
                    request.getProviderId(),
                    request.getRating(),
                    request.getComment()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getReason());
            }
            throw ex;
        }
    }

    @GetMapping("/provider/{providerId}")
    public List<Review> getReviewsByProvider(@PathVariable Long providerId) {
        return reviewService.getReviewsByProvider(providerId);
    }

    @GetMapping("/customer/{customerId}")
    public List<Review> getReviewsByCustomer(@PathVariable Long customerId) {
        return reviewService.getReviewsByCustomer(customerId);
    }

    @GetMapping
    public List<Review> getAllReviews() {
        return reviewService.getAllReviews();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody UpdateReviewRequest request) {
        try {
            Review updatedReview = reviewService.updateReview(id, request.getRating(), request.getComment());
            return ResponseEntity.ok(updatedReview);
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getReason());
            }
            if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getReason());
            }
            throw ex;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok().build();
        } catch (ResponseStatusException ex) {
            if (ex.getStatusCode() == HttpStatus.NOT_FOUND) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getReason());
            }
            if (ex.getStatusCode() == HttpStatus.FORBIDDEN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getReason());
            }
            throw ex;
        }
    }

    @Data
    public static class AddReviewRequest {
        private Long bookingId;
        private Long customerId;
        private Long providerId;
        private int rating;
        private String comment;
    }

    @Data
    public static class UpdateReviewRequest {
        private int rating;
        private String comment;
    }
}

