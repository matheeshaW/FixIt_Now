package com.fixitnow.backend.controller.dto;

import com.fixitnow.backend.model.Booking;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BookingDtos {

    // Request DTO for creating a booking
    public record CreateBookingRequest(
            @NotNull(message = "Service ID is required")
            Long serviceId,
            
            @NotNull(message = "Booking date is required")
            @Future(message = "Booking date must be in the future")
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime bookingDate,
            
            @Size(max = 500, message = "Special requests cannot exceed 500 characters")
            String specialRequests,
            
            @NotBlank(message = "Customer address is required")
            @Size(max = 200, message = "Address cannot exceed 200 characters")
            String customerAddress,
            
            @NotBlank(message = "Customer phone is required")
            @Size(max = 20, message = "Phone number cannot exceed 20 characters")
            @Pattern(regexp = "^[+]?[0-9\\s\\-()]+$", message = "Invalid phone number format")
            String customerPhone
    ) {}

    // Request DTO for updating booking status
    public record UpdateBookingStatusRequest(
            @NotNull(message = "Status is required")
            Booking.BookingStatus status,
            
            @Size(max = 500, message = "Notes cannot exceed 500 characters")
            String notes
    ) {}

    // Request DTO for updating booking details
    public record UpdateBookingRequest(
            @Future(message = "Booking date must be in the future")
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime bookingDate,
            
            @Size(max = 500, message = "Special requests cannot exceed 500 characters")
            String specialRequests,
            
            @Size(max = 200, message = "Address cannot exceed 200 characters")
            String customerAddress,
            
            @Size(max = 20, message = "Phone number cannot exceed 20 characters")
            @Pattern(regexp = "^[+]?[0-9\\s\\-()]+$", message = "Invalid phone number format")
            String customerPhone
    ) {}

    // Response DTO for booking details
    public record BookingResponse(
            Long bookingId,
            Long customerId,
            String customerName,
            String customerEmail,
            String customerPhone,
            Long serviceId,
            String serviceTitle,
            String serviceDescription,
            Long providerId,
            String providerName,
            String providerEmail,
            String providerPhone,
            String categoryName,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime bookingDate,
            String specialRequests,
            String customerAddress,
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            BigDecimal totalAmount,
            Booking.BookingStatus status,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            String createdAt,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            String updatedAt,
            Long version
    ) {
        public BookingResponse(Booking booking) {
            this(
                    booking.getBookingId(),
                    booking.getCustomer() != null ? booking.getCustomer().getUserId() : null,
                    booking.getCustomer() != null ? booking.getCustomer().getFullName() : "Unknown",
                    booking.getCustomer() != null ? booking.getCustomer().getEmail() : "Unknown",
                    booking.getCustomerPhone(),
                    booking.getService() != null ? booking.getService().getServiceId() : null,
                    booking.getService() != null ? booking.getService().getServiceTitle() : "Unknown",
                    booking.getService() != null ? booking.getService().getServiceDescription() : "Unknown",
                    booking.getService() != null && booking.getService().getProvider() != null 
                            ? booking.getService().getProvider().getUserId() : null,
                    booking.getService() != null && booking.getService().getProvider() != null 
                            ? booking.getService().getProvider().getFullName() : "Unknown",
                    booking.getService() != null && booking.getService().getProvider() != null 
                            ? booking.getService().getProvider().getEmail() : "Unknown",
                    booking.getService() != null && booking.getService().getProvider() != null 
                            ? booking.getService().getProvider().getPhone() : "Unknown",
                    booking.getService() != null && booking.getService().getCategory() != null 
                            ? booking.getService().getCategory().getCategoryName() : "Unknown",
                    booking.getBookingDate(),
                    booking.getSpecialRequests(),
                    booking.getCustomerAddress(),
                    booking.getTotalAmount(),
                    booking.getStatus(),
                    booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : "",
                    booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : "",
                    booking.getVersion()
            );
        }
    }

    // Simplified response DTO for listing bookings
    public record BookingSummaryResponse(
            Long bookingId,
            String serviceTitle,
            String providerName,
            String categoryName,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            LocalDateTime bookingDate,
            @JsonFormat(shape = JsonFormat.Shape.STRING)
            BigDecimal totalAmount,
            Booking.BookingStatus status,
            @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
            String createdAt
    ) {
        public BookingSummaryResponse(Booking booking) {
            this(
                    booking.getBookingId(),
                    booking.getService() != null ? booking.getService().getServiceTitle() : "Unknown",
                    booking.getService() != null && booking.getService().getProvider() != null 
                            ? booking.getService().getProvider().getFullName() : "Unknown",
                    booking.getService() != null && booking.getService().getCategory() != null 
                            ? booking.getService().getCategory().getCategoryName() : "Unknown",
                    booking.getBookingDate(),
                    booking.getTotalAmount(),
                    booking.getStatus(),
                    booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : ""
            );
        }
    }

    // DTO for booking statistics
    public record BookingStatsResponse(
            Long totalBookings,
            Long pendingBookings,
            Long confirmedBookings,
            Long completedBookings,
            Long cancelledBookings,
            BigDecimal totalRevenue,
            BigDecimal pendingRevenue
    ) {}
}

