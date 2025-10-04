import { useState } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";

export default function BookingForm({ service, onBookingCreated, onClose }) {
  const [formData, setFormData] = useState({
    bookingDate: "",
    specialRequests: "",
    customerAddress: "",
    customerPhone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

    
      // Ensure backend-compatible date format: yyyy-MM-dd'T'HH:mm:ss
      const bookingDateValue = formData.bookingDate?.trim();
      const bookingDateIso = bookingDateValue && bookingDateValue.length === 16
        ? `${bookingDateValue}:00`
        : bookingDateValue;

      const bookingData = {
        serviceId: service.serviceId,
        bookingDate: bookingDateIso,
        specialRequests: formData.specialRequests?.trim(),
        customerAddress: formData.customerAddress?.trim(),
        customerPhone: formData.customerPhone?.trim(),
      };

      const res = await api.post("/api/bookings", bookingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess("Booking created successfully!");
      setFormData({
        bookingDate: "",
        specialRequests: "",
        customerAddress: "",
        customerPhone: "",
      });

      // Notify parent component
      if (onBookingCreated) {
        onBookingCreated({ serviceId: service.serviceId, booking: res.data });
      }

      // Close modal after a short delay
      setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 1500);
    } catch (err) {
      console.error("Error creating booking:", err);
      if (err.response?.status === 403) {
        setError("You are not allowed to create a booking. Please log in as a customer.");
      } else if (err.response?.status === 401) {
        setError("Session expired or unauthorized. Please log in again.");
      } else {
        setError(err.response?.data || "Failed to create booking");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Allow booking 30 minutes from now
    return formatDate(now);
  };

  if (!service) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
          <p className="text-gray-500">No service selected for booking.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-700">Book Service</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Service Info */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800">
            {service.serviceTitle}
          </h3>
          <p className="text-blue-600 mb-2">{service.serviceDescription}</p>
          <div className="flex justify-between items-center">
            <div className="text-sm text-blue-600">
              <p>Provider: {service.providerName}</p>
              <p>Category: {service.categoryName}</p>
              <p>Location: {service.province}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-700">
                Rs.{service.price}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

      

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Booking Date & Time *
            </label>
            <input
              type="datetime-local"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleInputChange}
              min={getMinDateTime()}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select your preferred date and time for the service
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Your Address *
            </label>
            <textarea
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
              rows="3"
              placeholder="Enter your complete address where the service will be provided"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
              placeholder="Enter your phone number"
              required
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-300 focus:outline-none"
              rows="3"
              placeholder="Any special requirements or notes for the service provider"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.specialRequests.length}/500 characters
            </p>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Booking Summary</h4>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Service Fee:</span>
              <span className="font-semibold">Rs.{service.price}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t">
              <span className="font-semibold text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-blue-700">
                Rs.{service.price}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              // disabled={loading || userRole !== "CUSTOMER"}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Booking..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


