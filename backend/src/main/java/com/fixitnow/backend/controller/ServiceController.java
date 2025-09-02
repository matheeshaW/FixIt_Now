package com.fixitnow.backend.controller;

import com.fixitnow.backend.model.Service;
import com.fixitnow.backend.model.ServiceCategory;
import com.fixitnow.backend.model.User;
import com.fixitnow.backend.repository.ServiceCategoryRepository;
import com.fixitnow.backend.repository.ServiceRepository;
import com.fixitnow.backend.repository.UserRepository;
import com.fixitnow.backend.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ServiceController {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // DTOs for request/response
    public static class CreateServiceRequest {
        private String serviceTitle;
        private String serviceDescription;
        private Long categoryId;
        private BigDecimal price;
        private String availabilityStatus;
        private String province;

        // Getters and Setters
        public String getServiceTitle() {
            return serviceTitle;
        }

        public void setServiceTitle(String serviceTitle) {
            this.serviceTitle = serviceTitle;
        }

        public String getServiceDescription() {
            return serviceDescription;
        }

        public void setServiceDescription(String serviceDescription) {
            this.serviceDescription = serviceDescription;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public String getAvailabilityStatus() {
            return availabilityStatus;
        }

        public void setAvailabilityStatus(String availabilityStatus) {
            this.availabilityStatus = availabilityStatus;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }
    }

    public static class UpdateServiceRequest {
        private String serviceTitle;
        private String serviceDescription;
        private Long categoryId;
        private BigDecimal price;
        private String availabilityStatus;

        private String province;

        // Getters and Setters
        public String getServiceTitle() {
            return serviceTitle;
        }

        public void setServiceTitle(String serviceTitle) {
            this.serviceTitle = serviceTitle;
        }

        public String getServiceDescription() {
            return serviceDescription;
        }

        public void setServiceDescription(String serviceDescription) {
            this.serviceDescription = serviceDescription;
        }

        public Long getCategoryId() {
            return categoryId;
        }

        public void setCategoryId(Long categoryId) {
            this.categoryId = categoryId;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public void setPrice(BigDecimal price) {
            this.price = price;
        }

        public String getAvailabilityStatus() {
            return availabilityStatus;
        }

        public void setAvailabilityStatus(String availabilityStatus) {
            this.availabilityStatus = availabilityStatus;
        }

        public String getProvince() {
            return province;
        }

        public void setProvince(String province) {
            this.province = province;
        }
    }

    public static class ServiceResponse {
        private Long serviceId;
        private String serviceTitle;
        private String serviceDescription;
        private Long categoryId;
        private String categoryName;
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        private BigDecimal price;
        private String availabilityStatus;
        private String providerName;
        private String createdAt;
        private String province;

        public ServiceResponse(Service service) {
            this.serviceId = service.getServiceId();
            this.serviceTitle = service.getServiceTitle();
            this.serviceDescription = service.getServiceDescription();
            this.categoryId = service.getCategory() != null ? service.getCategory().getCategoryId() : null;
            this.categoryName = service.getCategory() != null ? service.getCategory().getCategoryName() : "Unknown";
            this.price = service.getPrice();
            this.availabilityStatus = service.getAvailabilityStatus() != null ? service.getAvailabilityStatus().name()
                    : "UNKNOWN";
            this.providerName = service.getProvider() != null ? service.getProvider().getFullName() : "Unknown";
            this.createdAt = service.getCreatedAt() != null ? service.getCreatedAt().toString() : "";
            this.province = service.getProvince();
        }

        // Getters
        public Long getServiceId() {
            return serviceId;
        }

        public String getServiceTitle() {
            return serviceTitle;
        }

        public String getServiceDescription() {
            return serviceDescription;
        }

        public String getCategoryName() {
            return categoryName;
        }

        public BigDecimal getPrice() {
            return price;
        }

        public String getAvailabilityStatus() {
            return availabilityStatus;
        }

        public String getProviderName() {
            return providerName;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public String getProvince() {
            return province;
        }
    }

    // CREATE - Create a new service
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> createService(@Valid @RequestBody CreateServiceRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            // Extract user ID from JWT token
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            User provider = userOpt.get();

            // Validate category
            Optional<ServiceCategory> categoryOpt = categoryRepository.findById(request.getCategoryId());
            if (categoryOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid category ID");
            }

            // Create service
            Service.AvailabilityStatus status;
            try {
                status = Service.AvailabilityStatus.valueOf(
                        request.getAvailabilityStatus() != null ? request.getAvailabilityStatus() : "AVAILABLE");
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body("Invalid availability status. Must be AVAILABLE or UNAVAILABLE");
            }

            Service service = Service.builder()
                    .provider(provider)
                    .category(categoryOpt.get())
                    .serviceTitle(request.getServiceTitle())
                    .serviceDescription(request.getServiceDescription())
                    .price(request.getPrice())
                    .availabilityStatus(status)
                    .province(request.getProvince())
                    .build();

            Service savedService = serviceRepository.save(service);
            return ResponseEntity.status(HttpStatus.CREATED).body(new ServiceResponse(savedService));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating service: " + e.getMessage());
        }
    }

    // READ - Get all services (public)
    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices() {
        List<Service> services = serviceRepository.findAll();
        List<ServiceResponse> responses = services.stream()
                .map(ServiceResponse::new)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // READ - Get service by ID (public)
    @GetMapping("/{serviceId}")
    public ResponseEntity<?> getServiceById(@PathVariable Long serviceId) {
        Optional<Service> serviceOpt = serviceRepository.findById(serviceId);
        if (serviceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new ServiceResponse(serviceOpt.get()));
    }

    // READ - Get services by provider ID (public)
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ServiceResponse>> getServicesByProvider(@PathVariable Long providerId) {
        List<Service> services = serviceRepository.findByProviderUserId(providerId);
        List<ServiceResponse> responses = services.stream()
                .map(ServiceResponse::new)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // READ - Get services by category (public)
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ServiceResponse>> getServicesByCategory(@PathVariable Long categoryId) {
        List<Service> services = serviceRepository.findByCategoryCategoryId(categoryId);
        List<ServiceResponse> responses = services.stream()
                .map(ServiceResponse::new)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // READ - Search services (public)
    @GetMapping("/search")
    public ResponseEntity<List<ServiceResponse>> searchServices(@RequestParam String query) {
        List<Service> services = serviceRepository.findByServiceTitleContainingOrServiceDescriptionContaining(query,
                query);
        List<ServiceResponse> responses = services.stream()
                .map(ServiceResponse::new)
                .toList();
        return ResponseEntity.ok(responses);
    }

    // READ - Get distinct provinces (public)
    @GetMapping("/provinces")
    public ResponseEntity<List<String>> getProvinces() {
        List<String> provinces = serviceRepository.findDistinctProvinces();
        return ResponseEntity.ok(provinces);
    }

    // READ - Get my services (provider only)
    @GetMapping("/my-services")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<ServiceResponse>> getMyServices(@RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
            }

            List<Service> services = serviceRepository.findByProvider(userOpt.get());
            List<ServiceResponse> responses = services.stream()
                    .map(ServiceResponse::new)
                    .toList();
            return ResponseEntity.ok(responses);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // UPDATE - Update a service (provider only, their own service)
    @PutMapping("/{serviceId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updateService(@PathVariable Long serviceId,
            @Valid @RequestBody UpdateServiceRequest request,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            User provider = userOpt.get();

            // Find service and ensure it belongs to the provider
            Optional<Service> serviceOpt = serviceRepository.findByServiceIdAndProvider(serviceId, provider);
            if (serviceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Service service = serviceOpt.get();

            // Update fields if provided
            if (request.getServiceTitle() != null) {
                service.setServiceTitle(request.getServiceTitle());
            }
            if (request.getServiceDescription() != null) {
                service.setServiceDescription(request.getServiceDescription());
            }
            if (request.getCategoryId() != null) {
                Optional<ServiceCategory> categoryOpt = categoryRepository.findById(request.getCategoryId());
                if (categoryOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Invalid category ID");
                }
                service.setCategory(categoryOpt.get());
            }
            if (request.getPrice() != null) {
                service.setPrice(request.getPrice());
            }
            if (request.getAvailabilityStatus() != null) {
                try {
                    service.setAvailabilityStatus(Service.AvailabilityStatus.valueOf(request.getAvailabilityStatus()));
                } catch (IllegalArgumentException e) {
                    return ResponseEntity.badRequest()
                            .body("Invalid availability status. Must be AVAILABLE or UNAVAILABLE");
                }
            }

            Service updatedService = serviceRepository.save(service);
            return ResponseEntity.ok(new ServiceResponse(updatedService));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating service: " + e.getMessage());
        }
    }

    // DELETE - Delete a service (provider only, their own service)
    @DeleteMapping("/{serviceId}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> deleteService(@PathVariable Long serviceId,
            @RequestHeader("Authorization") String token) {
        try {
            String email = jwtUtil.extractUsername(token.replace("Bearer ", ""));
            Optional<User> userOpt = userRepository.findByEmail(email);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }

            User provider = userOpt.get();

            // Check if service exists and belongs to the provider
            if (!serviceRepository.existsByServiceIdAndProvider(serviceId, provider)) {
                return ResponseEntity.notFound().build();
            }

            serviceRepository.deleteById(serviceId);
            return ResponseEntity.ok("Service deleted successfully");

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting service: " + e.getMessage());
        }
    }

    // Toggle service availability status

    @PatchMapping("/{serviceId}/toggle-status")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceResponse> toggleServiceStatus(
            @PathVariable Long serviceId,
            @AuthenticationPrincipal User provider) {

        // Find service belonging to this provider
        Service service = serviceRepository.findByServiceIdAndProvider(serviceId, provider)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));

        // Toggle status
        Service.AvailabilityStatus newStatus = (service.getAvailabilityStatus() == Service.AvailabilityStatus.AVAILABLE)
                ? Service.AvailabilityStatus.UNAVAILABLE
                : Service.AvailabilityStatus.AVAILABLE;

        service.setAvailabilityStatus(newStatus);
        Service updatedService = serviceRepository.save(service);

        return ResponseEntity.ok(new ServiceResponse(updatedService));
    }

}
