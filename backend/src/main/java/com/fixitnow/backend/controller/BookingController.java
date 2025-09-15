package com.fixitnow.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.backend.controller.dto.BookingDtos.BookingResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.BookingStatsResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.BookingSummaryResponse;
import com.fixitnow.backend.controller.dto.BookingDtos.CreateBookingRequest;
import com.fixitnow.backend.controller.dto.BookingDtos.UpdateBookingRequest;
import com.fixitnow.backend.controller.dto.BookingDtos.UpdateBookingStatusRequest;
import com.fixitnow.backend.model.Booking;
import com.fixitnow.backend.security.JwtUtil;
import com.fixitnow.backend.service.BookingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    /**
     * Create a new booking (Customer only)
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingResponse booking = bookingService.createBooking(request, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating booking: " + e.getMessage());
        }
    }

    /**
     * Get booking by ID (Customer or Provider)
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingResponse booking = bookingService.getBookingById(bookingId, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching booking: " + e.getMessage());
        }
    }

    /**
     * Get all bookings for current customer
     */
    @GetMapping("/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerBookings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getCustomerBookings(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching customer bookings: " + e.getMessage());
        }
    }

    /**
     * Get all bookings for current provider
     */
    @GetMapping("/provider")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getProviderBookings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getProviderBookings(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching provider bookings: " + e.getMessage());
        }
    }

    /**
     * Get bookings by status for current customer
     */
    @GetMapping("/customer/status/{status}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getCustomerBookingsByStatus(
            @PathVariable Booking.BookingStatus status,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getCustomerBookingsByStatus(email, status);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching customer bookings: " + e.getMessage());
        }
    }

    /**
     * Get bookings by status for current provider
     */
    @GetMapping("/provider/status/{status}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getProviderBookingsByStatus(
            @PathVariable Booking.BookingStatus status,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getProviderBookingsByStatus(email, status);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching provider bookings: " + e.getMessage());
        }
    }

    /**
     * Update booking status (Provider only)
     */
    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateBookingStatusRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, request, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating booking status: " + e.getMessage());
        }
    }

    /**
     * Update booking details (Customer only)
     */
    @PutMapping("/{bookingId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> updateBooking(
            @PathVariable Long bookingId,
            @Valid @RequestBody UpdateBookingRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingResponse booking = bookingService.updateBooking(bookingId, request, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating booking: " + e.getMessage());
        }
    }

    /**
     * Cancel booking (Customer only)
     */
    @PutMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> cancelBooking(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingResponse booking = bookingService.cancelBooking(bookingId, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling booking: " + e.getMessage());
        }
    }

    /**
     * Get upcoming bookings for current customer
     */
    @GetMapping("/customer/upcoming")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getUpcomingCustomerBookings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getUpcomingCustomerBookings(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching upcoming bookings: " + e.getMessage());
        }
    }

    /**
     * Get upcoming bookings for current provider
     */
    @GetMapping("/provider/upcoming")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getUpcomingProviderBookings(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            List<BookingSummaryResponse> bookings = bookingService.getUpcomingProviderBookings(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching upcoming bookings: " + e.getMessage());
        }
    }

    /**
     * Get booking statistics for current provider
     */
    @GetMapping("/provider/stats")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> getProviderBookingStats(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            BookingStatsResponse stats = bookingService.getProviderBookingStats(email);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching booking statistics: " + e.getMessage());
        }
    }

    /**
     * Quick status update endpoints for common operations
     */
    @PatchMapping("/{bookingId}/confirm")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> confirmBooking(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(Booking.BookingStatus.CONFIRMED, null);
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, request, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error confirming booking: " + e.getMessage());
        }
    }

    @PatchMapping("/{bookingId}/start")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> startBooking(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(Booking.BookingStatus.IN_PROGRESS, null);
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, request, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error starting booking: " + e.getMessage());
        }
    }

    @PatchMapping("/{bookingId}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> completeBooking(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            UpdateBookingStatusRequest request = new UpdateBookingStatusRequest(Booking.BookingStatus.COMPLETED, null);
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, request, email);
            return ResponseEntity.ok(booking);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error completing booking: " + e.getMessage());
        }
    }
}
