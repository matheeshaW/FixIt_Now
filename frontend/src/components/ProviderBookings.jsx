import { useState, useEffect } from "react";
import api from "../services/api";
import { getToken } from "../utils/auth";

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchUpcomingBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/bookings/provider", {
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

      const response = await api.get("/api/bookings/provider/upcoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingBookings(response.data);
    } catch (err) {
      console.error("Error fetching upcoming bookings:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get("/api/bookings/provider/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchBookingsByStatus = async (status) => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await api.get(`/api/bookings/provider/status/${status}`, {
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

  const handleStatusUpdate = async (bookingId, action) => {
    try {
      const token = getToken();
      let endpoint = "";
      
      switch (action) {
        case "confirm":
          endpoint = `/api/bookings/${bookingId}/confirm`;
          break;
        case "start":
          endpoint = `/api/bookings/${bookingId}/start`;
          break;
        case "complete":
          endpoint = `/api/bookings/${bookingId}/complete`;
          break;
        default:
          throw new Error("Invalid action");
      }

      await api.patch(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(`Booking ${action}ed successfully!`);
      fetchBookings();
      fetchUpcomingBookings();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action}ing booking:`, err);
      setError(`Failed to ${action} booking`);
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
    const actions = [];

    switch (booking.status) {
      case "PENDING":
        actions.push(
          <button
            key="confirm"
            onClick={() => handleStatusUpdate(booking.bookingId, "confirm")}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Confirm
          </button>
        );
        break;
      case "CONFIRMED":
        actions.push(
          <button
            key="start"
            onClick={() => handleStatusUpdate(booking.bookingId, "start")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Start Service
          </button>
        );
        break;
      case "IN_PROGRESS":
        actions.push(
          <button
            key="complete"
            onClick={() => handleStatusUpdate(booking.bookingId, "complete")}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition"
          >
            Complete
          </button>
        );
        break;
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-green-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-green-700">Booking Management</h2>
        <div className="text-sm text-green-600">
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

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-700">Total Bookings</h3>
            <p className="text-2xl font-bold text-green-800">{stats.totalBookings}</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-700">Pending</h3>
            <p className="text-2xl font-bold text-yellow-800">{stats.pendingBookings}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-700">Confirmed</h3>
            <p className="text-2xl font-bold text-blue-800">{stats.confirmedBookings}</p>
          </div>
          <div className="bg-purple-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-700">Completed</h3>
            <p className="text-2xl font-bold text-purple-800">{stats.completedBookings}</p>
          </div>
        </div>
      )}

      {/* Revenue Summary */}
      {stats && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <h3 className="font-semibold text-green-700 mb-2">Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-green-600">Total Revenue (Completed)</p>
              <p className="text-xl font-bold text-green-800">Rs.{stats.totalRevenue}</p>
            </div>
            <div>
              <p className="text-sm text-green-600">Pending Revenue (Confirmed)</p>
              <p className="text-xl font-bold text-green-800">Rs.{stats.pendingRevenue}</p>
            </div>
          </div>
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
                ? "bg-green-100 border-b-0 text-green-800"
                : "text-gray-600 hover:text-green-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upcoming Bookings Alert */}
      {upcomingBookings.length > 0 && activeTab === "all" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">
            Upcoming Bookings ({upcomingBookings.length})
          </h3>
          <div className="space-y-2">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div key={booking.bookingId} className="flex justify-between items-center text-sm">
                <span className="text-green-700">
                  {booking.serviceTitle} - {formatDate(booking.bookingDate)}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
              </div>
            ))}
            {upcomingBookings.length > 3 && (
              <p className="text-green-600 text-sm">
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
                    <p><strong>Customer:</strong> {booking.customerName}</p>
                    <p><strong>Category:</strong> {booking.categoryName}</p>
                    <p><strong>Booking Date:</strong> {formatDate(booking.bookingDate)}</p>
                    <p><strong>Created:</strong> {formatDate(booking.createdAt)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-green-700 mb-2">
                    Rs.{booking.totalAmount}
                  </p>
                  <div className="flex gap-2">
                    {getStatusActions(booking)}
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Booking ID:</strong> #{booking.bookingId}</p>
                    <p><strong>Customer Contact:</strong> {booking.customerEmail}</p>
                    <p><strong>Customer Phone:</strong> {booking.customerPhone}</p>
                  </div>
                  <div>
                    <p><strong>Service Category:</strong> {booking.categoryName}</p>
                    <p><strong>Status:</strong> {booking.status}</p>
                    <p><strong>Customer Address:</strong> {booking.customerAddress}</p>
                  </div>
                </div>
                
                {booking.specialRequests && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm">
                      <strong>Special Requests:</strong> {booking.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




