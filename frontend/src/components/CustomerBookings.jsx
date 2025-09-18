import { useState, useEffect } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";

export default function CustomerBookings({ onBookingCancelled }) {
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchUpcomingBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/bookings/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const fetchUpcomingBookings = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get("/api/bookings/customer/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingBookings(response.data);
    } catch (err) {
      console.error("Error fetching upcoming bookings:", err);
    }
  };

  const fetchBookingsByStatus = async (status) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get(`/api/bookings/customer/status/${status}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings by status:", err);
      setError("Failed to fetch bookings");
    }
  };

  const handleStatusFilter = (status) => {
    setActiveTab(status);
    if (status === "all") {
      fetchBookings();
    } else {
      fetchBookingsByStatus(status);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const token = getToken();
      const res = await api.put(`/api/bookings/${bookingId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Booking cancelled successfully!");
      fetchBookings();
      fetchUpcomingBookings();
      // notify parent so dashboard can re-include service in browse list
      if (onBookingCancelled) {
        onBookingCancelled({ serviceId: res.data.serviceId, bookingId });
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusActions = (booking) => {
    if (booking.status === "PENDING" || booking.status === "CONFIRMED") {
      return (
        <button
          onClick={() => handleCancelBooking(booking.bookingId)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
        >
          Cancel Booking
        </button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-blue-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-700">My Bookings</h2>
        <div className="text-sm text-blue-600">
          {upcomingBookings.length} upcoming booking{upcomingBookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex border-b gap-2">
        {[
          { key: "all", label: "All Bookings" },
          { key: "PENDING", label: "Pending" },
          { key: "CONFIRMED", label: "Confirmed" },
          { key: "IN_PROGRESS", label: "In Progress" },
          { key: "COMPLETED", label: "Completed" },
          { key: "CANCELLED", label: "Cancelled" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleStatusFilter(tab.key)}
            className={`px-4 py-2 font-medium rounded-t-lg transition ${
              activeTab === tab.key
                ? "bg-blue-100 border-b-0 text-blue-800"
                : "text-gray-600 hover:text-blue-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upcoming Bookings Alert */}
      {upcomingBookings.length > 0 && activeTab === "all" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">
            Upcoming Bookings ({upcomingBookings.length})
          </h3>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.bookingId} className="flex justify-between items-center text-sm">
                <span className="text-blue-700">
                  {booking.serviceTitle} - {formatDate(booking.bookingDate)}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
            {upcomingBookings.length > 3 && (
              <p className="text-blue-600 text-sm">
                +{upcomingBookings.length - 3} more upcoming bookings
              </p>
            )}
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {activeTab === "all" 
                ? "No bookings found." 
                : `No ${activeTab.toLowerCase()} bookings found.`}
            </p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.bookingId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.serviceTitle}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Provider:</strong> {booking.providerName}</p>
                    <p><strong>Category:</strong> {booking.categoryName}</p>
                    <p><strong>Booking Date:</strong> {formatDate(booking.bookingDate)}</p>
                    <p><strong>Created:</strong> {formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-blue-700 mb-2">
                    Rs.{booking.totalAmount}
                  </p>
                  {getStatusActions(booking)}
                </div>
              </div>

              {/* Booking Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Booking ID:</strong> #{booking.bookingId}</p>
                    <p><strong>Provider Contact:</strong> {booking.providerEmail}</p>
                  </div>
                  <div>
                    <p><strong>Service Category:</strong> {booking.categoryName}</p>
                    <p><strong>Status:</strong> {booking.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Statistics */}
      {activeTab === "all" && bookings.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Booking Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{bookings.length}</p>
              <p className="text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === "PENDING").length}
              </p>
              <p className="text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === "CONFIRMED").length}
              </p>
              <p className="text-gray-600">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === "COMPLETED").length}
              </p>
              <p className="text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {bookings.filter(b => b.status === "CANCELLED").length}
              </p>
              <p className="text-gray-600">Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





