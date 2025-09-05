import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getToken } from "../utils/auth";

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
    <div className="min-h-screen w-full bg-gradient-to-br from-green-100 via-green-200 to-green-50 p-10">
      <div className="max-w-6xl mx-auto p-6 bg-white rounded-3xl">
        <h1 className="text-3xl font-bold mb-6 text-green-700">
          Provider Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex border-b mb-6 gap-2">
          {["dashboard", "services", "create"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium rounded-t-lg transition ${
                activeTab === tab
                  ? "bg-green-100 border-b-0 text-green-800"
                  : "text-gray-600 hover:text-green-700"
              }`}
            >
              {tab === "dashboard"
                ? "Dashboard"
                : tab === "services"
                ? "My Services"
                : "Create Service"}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && activeTab === "services" && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4 shadow">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow">
            {error}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Services
              </h3>
              <p className="text-3xl font-bold text-green-700">
                {services.length}
              </p>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Available Services
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {
                  services.filter((s) => s.availabilityStatus === "AVAILABLE")
                    .length
                }
              </p>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-green-800">
                Rs.
                {services
                  .reduce((sum, s) => sum + parseFloat(s.price), 0)
                  .toFixed(2)}
              </p>
            </div>

            {/* Recent Services */}
            <div className="col-span-full bg-green-50 p-6 rounded shadow">
              <h3 className="text-xl font-semibold mb-4 text-green-700">
                Recent Services
              </h3>
              {services.length === 0 ? (
                <p className="text-gray-500">No services created yet.</p>
              ) : (
                <div className="space-y-3">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.serviceId}
                      className="flex justify-between items-center p-4 bg-white rounded shadow hover:bg-green-100 transition"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {service.serviceTitle}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {service.categoryName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-700">
                          Rs.{service.price}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            service.availabilityStatus === "AVAILABLE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
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
              <p className="text-gray-500">
                No services created yet. Create your first service!
              </p>
            ) : (
              services.map((service) => (
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
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Category: {service.categoryName}</span>
                        <span>Created: {formatDate(service.createdAt)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-700">
                        Rs.{service.price}
                      </p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          service.availabilityStatus === "AVAILABLE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {service.availabilityStatus}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(service.serviceId)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition"
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
          <div className="bg-white shadow rounded p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Create New Service
            </h2>
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Service Title *</label>
                <input
                  type="text"
                  name="serviceTitle"
                  value={formData.serviceTitle}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                  placeholder="Enter service title"
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
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                  rows="4"
                  placeholder="Describe your service"
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Province *</label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
                  required
                >
                  <option value="">Select province</option>
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
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-green-300 focus:outline-none"
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
      </div>
    </div>
  );
}
