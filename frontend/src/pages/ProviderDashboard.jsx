import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getToken } from "../utils/auth";
import ProviderBookings from "../components/ProviderBookings";
import ProviderReviews from "../components/ProviderReviews";

export default function ProviderDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const provinces = [
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

  // Form state for creating service
  const [formData, setFormData] = useState({
    serviceTitle: "",
    serviceDescription: "",
    categoryId: "",
    price: "",
    availabilityStatus: "AVAILABLE",
    province: "",
  });

  // Fetch services and categories on component mount
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Auto-hide messages in services tab
  useEffect(() => {
    if (message && activeTab === "services") {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message, activeTab]);

  const fetchServices = async () => {
    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await api.get("/api/services/my-services", {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const serviceData = {
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        availabilityStatus: formData.availabilityStatus,
        province: formData.province,
      };

      await api.post("/api/services", serviceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Service created successfully!");
      setFormData({
        serviceTitle: "",
        serviceDescription: "",
        categoryId: "",
        price: "",
        availabilityStatus: "AVAILABLE",
        province: "",
      });

      await fetchServices();
      setActiveTab("services");
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err.response?.data || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      const token = getToken();
      await api.delete(`/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Service deleted successfully!");
      await fetchServices();
    } catch (err) {
      console.error("Error deleting service:", err);
      setError("Failed to delete service");
    }
  };

  const handleToggleStatus = async (serviceId) => {
    try {
      const token = getToken();
      await api.patch(
        `/api/services/${serviceId}/toggle-status`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Service status updated!");
      await fetchServices();
    } catch (err) {
      console.error("Error updating service status:", err);
      setError("Failed to update service status");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0A0B] via-[#0F172A] to-[#0B1220] text-[#ffffff] p-10">
      <div className="max-w-6xl mx-auto p-6 bg-[#111827] rounded-3xl border border-[#1F2937] shadow">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Provider Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-6 gap-2">
          {["dashboard", "services", "create", "bookings", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === tab
                  ? "bg-[#1F2937] border-b-0 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "services"
                ? "My Services"
                : tab === "create"
                ? "Create Service"
                : tab === "bookings"
                ? "Bookings"
                : "Reviews"}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && activeTab === "services" && (
          <div className="bg-[#0F172A] border border-[#1F2937] text-green-300 px-4 py-3 rounded mb-4 shadow">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-[#0F172A] border border-[#1F2937] text-red-300 px-4 py-3 rounded mb-4 shadow">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0F172A] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-2">
                Total Services
              </h3>
              <p className="text-3xl font-bold text-[#c6c4c4]">
                {services.length}
              </p>
            </div>
            <div className="bg-[#0F172A] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-2">
                Available Services
              </h3>
              <p className="text-3xl font-bold text-[#c6c4c4]">
                {
                  services.filter((s) => s.availabilityStatus === "AVAILABLE")
                    .length
                }
              </p>
            </div>
            <div className="bg-[#0F172A] border border-[#1F2937] rounded-2xl p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-white mb-2">
                Total Service Value
              </h3>
              <p className="text-3xl font-bold text-green-500">
                Rs.
                {services
                  .reduce((sum, s) => sum + parseFloat(s.price), 0)
                  .toFixed(2)}
              </p>
            </div>

            {/* Recent Services */}
            <div className="col-span-full  p-6 rounded shadow">
              <h3 className="text-xl font-semibold mb-4 text-white">
                Recent Services
              </h3>
              {services.length === 0 ? (
                <p className="text-white">No services created yet.</p>
              ) : (
                <div className="space-y-3">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.serviceId}
                      className="flex justify-between items-center p-4 bg-[#0F172A] border border-[#1F2937] rounded-lg shadow hover:bg-[#1F2937] transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-white">
                          {service.serviceTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {service.categoryName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-500">
                          Rs.{service.price}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            service.availabilityStatus === "AVAILABLE"
                              ? " text-green-500"
                              : " text-red-500"
                          }`}
                        >
                          {service.availabilityStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-white">
                No services created yet. Create your first service!
              </p>
            ) : (
              services.map((service) => (
                <div
                  key={service.serviceId}
                  className="bg-[#0F172A] border border-[#1F2937] rounded-lg shadow p-4 hover:bg-[#1F2937] transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">
                        {service.serviceTitle}
                      </h3>
                      <p className="text-[#b6b5b5] mb-2">
                        {service.serviceDescription}
                      </p>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Category: {service.categoryName}</span>
                        <span>Created: {formatDate(service.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">
                        Rs.{service.price}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.availabilityStatus === "AVAILABLE"
                            ? " text-green-500"
                            : " text-red-500"
                        }`}
                      >
                        {service.availabilityStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(service.serviceId)}
                      className="bg-yellow-300 hover:bg-yellow-400 text-black px-3 py-1 rounded transition"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.serviceId)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Service Tab */}
        {activeTab === "create" && (
          <div className="bg-[#0F172A] border border-[#1F2937] shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Create New Service
            </h2>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">
                  Service Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="serviceTitle"
                  value={formData.serviceTitle}
                  onChange={handleInputChange}
                  placeholder="Enter service title"
                  className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-green-300 focus:outline-none"
                  required
                  maxLength={150}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  name="serviceDescription"
                  value={formData.serviceDescription}
                  onChange={handleInputChange}
                  className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-green-300 focus:outline-none"
                  rows="4"
                  placeholder="Describe your service"
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded text-white focus:ring-2 focus:ring-green-300 focus:outline-none"
                    required
                  >
                    <option value="" disabled className=" text-gray-400">
                      Select category
                    </option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                        className="text-white"
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">
                    Price (Rs.) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded placeholder-gray-400 focus:ring-2 focus:ring-green-300 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Province <span className="text-red-400">*</span>
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                  required
                >
                  <option value="" disabled className=" text-gray-400">
                    Select province
                  </option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">
                  Availability Status
                </label>
                <select
                  name="availabilityStatus"
                  value={formData.availabilityStatus}
                  onChange={handleInputChange}
                  className="w-full bg-[#1b232e] border border-[#2a3b53] p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                {loading ? "Creating..." : "Create Service"}
              </button>
            </form>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <ProviderBookings />
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <ProviderReviews />
        )}
      </div>
    </div>
  );
}
