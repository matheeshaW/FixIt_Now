import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getToken } from "../utils/auth";
import BookingForm from "../components/BookingForm";
import CustomerBookings from "../components/CustomerBookings";
import CustomerReviews from "../components/CustomerReviews";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookedServiceIds, setBookedServiceIds] = useState(new Set());

  const allProvinces = [
    "Central Province",
    "Eastern Province",
    "North Central Province",
    "Northern Province",
    "North Western Province",
    "Sabaragamuwa Province",
    "Southern Province",
    "Uva Province",
    "Western Province",
  ];

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchProvinces();
    fetchMyActiveBookings();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/services"); // public services
      setServices(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching services:", err);
      setError("Failed to fetch services");
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/categories");
      setCategories(response.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to fetch categories");
    }
  };

  const fetchProvinces = async () => {
    try {
      const response = await api.get("/api/services/provinces");
      setProvinces(response.data);
    } catch (err) {
      console.error("Error fetching provinces:", err);
      setError("Failed to fetch provinces");
    }
  };

  const fetchMyActiveBookings = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await api.get("/api/bookings/customer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeStatuses = new Set(["PENDING", "CONFIRMED", "IN_PROGRESS"]);
      const activeServiceIds = new Set(
        (res.data || [])
          .filter((b) => activeStatuses.has(b.status))
          .map((b) => b.serviceId)
      );
      setBookedServiceIds(activeServiceIds);
    } catch (err) {
      // silently ignore for browse tab
    }
  };

  const toggleFavorite = (serviceId) => {
    if (favorites.includes(serviceId)) {
      // Remove from favorites
      setFavorites(favorites.filter((id) => id !== serviceId));
    } else {
      // Add to favorites
      setFavorites([...favorites, serviceId]);
    }
  };

  const handleBookService = (service) => {
    setSelectedService(service);
    setShowBookingForm(true);
  };

  const handleBookingCreated = (created) => {
    // created may be undefined from child; refetch to be safe
    if (created?.serviceId) {
      setBookedServiceIds((prev) => new Set(prev).add(created.serviceId));
    } else {
      fetchMyActiveBookings();
    }
    setActiveTab("bookings");
  };

  const handleBookingCancelled = (cancelled) => {
    if (cancelled?.serviceId) {
      setBookedServiceIds((prev) => {
        const next = new Set(prev);
        next.delete(cancelled.serviceId);
        return next;
      });
    } else {
      fetchMyActiveBookings();
    }
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
    setSelectedService(null);
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  const filteredServices = services.filter((s) => {
    const categoryMatch = selectedCategory
      ? s.categoryId === Number(selectedCategory)
      : true;
    const provinceMatch = selectedProvince
      ? s.province === selectedProvince
      : true;
    const priceMatch = s.price >= priceRange[0] && s.price <= priceRange[1];
    const availabilityMatch = availabilityFilter
      ? s.availabilityStatus === availabilityFilter
      : true;
    const searchMatch = searchQuery
      ? s.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const notAlreadyBooked = !bookedServiceIds.has(s.serviceId);
    return (
      categoryMatch &&
      provinceMatch &&
      priceMatch &&
      availabilityMatch &&
      searchMatch &&
      notAlreadyBooked
    );
  });

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#F8FAFC] via-[#EEF3F7] to-[#CBD5E1] p-10">
      <div className="max-w-6xl mx-auto p-6  bg-white rounded-3xl">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">
          Customer Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-6 gap-2">
          {["browse", "favorites", "bookings", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === tab
                  ? "bg-blue-100 border-b-0 text-blue-800"
                  : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {tab === "browse" 
                ? "Browse Services" 
                : tab === "favorites" 
                ? "Favorites" 
                : tab === "bookings"
                ? "My Bookings"
                : "My Reviews"}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow">
            {error}
          </div>
        )}

        {/* Browse Tab */}
        {activeTab === "browse" && (
          <div className="space-y-6">
            {/* Filters Card */}
            <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-2xl shadow-lg p-4 mb-3">
              <h2 className="text-xl font-semibold mb-4 text-blue-700">
                Filters
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                {/* Search */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-blue-700">
                    Search
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services..."
                    className="border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 p-2 rounded-lg transition"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-blue-700">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 p-2 rounded-lg transition"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.categoryId} value={cat.categoryId}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Province */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-blue-700">
                    Province
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 p-2 rounded-lg transition"
                  >
                    <option value="">All Provinces</option>
                    {provinces.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-blue-700">
                    Price
                  </label>
                  <select
                    value={JSON.stringify(priceRange)}
                    onChange={(e) => setPriceRange(JSON.parse(e.target.value))}
                    className="border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 p-2 rounded-lg transition"
                  >
                    <option value="[0,500000]">All</option>
                    <option value="[0,2000]">Rs.0 - Rs.2,000</option>
                    <option value="[2000,5000]">Rs.2,000 - Rs.5,000</option>
                    <option value="[5000,10000]">Rs.5,000 - Rs.10,000</option>
                    <option value="[10000,20000]">Rs.10,000 - Rs.20,000</option>
                  </select>
                </div>

                {/* Availability */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium mb-1 text-blue-700">
                    Availability
                  </label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="border border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 p-2 rounded-lg transition"
                  >
                    <option value="">All</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="UNAVAILABLE">Unavailable</option>
                  </select>
                </div>

                {/* Reset Button */}
                <div className="flex items-center mt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedProvince("");
                      setPriceRange([0, 500000]);
                      setAvailabilityFilter("");
                      setSearchQuery("");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg shadow transition"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-4">
              {filteredServices.length === 0 ? (
                <p className="text-gray-500">No services available.</p>
              ) : (
                filteredServices.map((service) => (
                  <div
                    key={service.serviceId}
                    className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 rounded-2xl p-4 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {service.serviceTitle}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {service.serviceDescription}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>Category: {service.categoryName}</span>
                          <span>Province: {service.province}</span>
                          <span>Added: {formatDate(service.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          Rs.{service.price}
                        </p>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            service.availabilityStatus === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {service.availabilityStatus}
                        </span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleBookService(service)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() =>
                          navigate("/customer/service-reviews", {
                            state: {
                              providerId: service.providerId,
                              providerName: service.providerName,
                            },
                          })
                        }
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Reviews
                      </button>
                      <button
                        onClick={() => toggleFavorite(service.serviceId)}
                        className={`px-3 py-1 rounded text-sm transition ${
                          favorites.includes(service.serviceId)
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-gray-600 hover:bg-gray-700 text-white"
                        }`}
                      >
                        {favorites.includes(service.serviceId)
                          ? "Remove from Favorites"
                          : "Add to Favorites"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            {favorites.length === 0 ? (
              <p className="text-gray-500">No favorite services yet.</p>
            ) : (
              services
                .filter((s) => favorites.includes(s.serviceId))
                .map((service) => (
                  <div
                    key={service.serviceId}
                    className="bg-white shadow rounded p-4 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {service.serviceTitle}
                        </h3>
                        <p className="text-gray-600 mb-2">
                          {service.serviceDescription}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500 mb-2">
                          <span>Category: {service.categoryName}</span>
                          <span>Province: {service.province}</span>
                          <span>Added: {formatDate(service.createdAt)}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              service.availabilityStatus === "AVAILABLE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {service.availabilityStatus}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          Rs.{service.price}
                        </p>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button 
                        onClick={() => handleBookService(service)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() =>
                          setFavorites(
                            favorites.filter((id) => id !== service.serviceId)
                          )
                        }
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                          Remove from Favorites
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <CustomerBookings onBookingCancelled={handleBookingCancelled} />
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <CustomerReviews />
        )}
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm
          service={selectedService}
          onBookingCreated={handleBookingCreated}
          onClose={handleCloseBookingForm}
        />
      )}
    </div>
  );
}
