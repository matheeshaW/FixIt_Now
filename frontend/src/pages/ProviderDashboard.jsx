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

  useEffect(() => {
    if (message && activeTab === "services") {
      const timer = setTimeout(() => {
        setMessage("");
      }, 3000);

      return () => clearTimeout(timer); // cleanup when component unmounts or tab changes
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      const response = await api.post("/api/services", serviceData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("Service created successfully!");
      setFormData({
        serviceTitle: "",
        serviceDescription: "",
        categoryId: "",
        price: "",
        availabilityStatus: "AVAILABLE",
      });

      // Refresh services list
      await fetchServices();

      // Switch to services tab to show the new service
      setActiveTab("services");
    } catch (err) {
      console.error("Error creating service:", err);
      setError(err.response?.data || "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) {
      return;
    }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Provider Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`px-4 py-2 font-medium ${
            activeTab === "dashboard"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 font-medium ${
            activeTab === "services"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          My Services
        </button>
        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2 font-medium ${
            activeTab === "create"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Create Service
        </button>
      </div>

      {/* Messages */}
      {message && activeTab === "services" && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Services
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {services.length}
              </p>
            </div>
            <div className="bg-white rounded shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                Rs.
                {services
                  .reduce((sum, s) => sum + parseFloat(s.price), 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Services</h3>
            {services.length === 0 ? (
              <p className="text-gray-500">No services created yet.</p>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 3).map((service) => (
                  <div
                    key={service.serviceId}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <h4 className="font-medium">{service.serviceTitle}</h4>
                      <p className="text-sm text-gray-600">
                        {service.categoryName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Rs.{service.price}</p>
                      <p className="text-sm text-gray-600">
                        {service.availabilityStatus}
                      </p>
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
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Services</h2>
          {services.length === 0 ? (
            <p className="text-gray-500">
              No services created yet. Create your first service!
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.serviceId} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
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
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(service.serviceId)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => handleDeleteService(service.serviceId)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Service Tab */}
      {activeTab === "create" && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Create New Service</h2>
          <form onSubmit={handleCreateService} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Service Title *</label>
              <input
                type="text"
                name="serviceTitle"
                value={formData.serviceTitle}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
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
                  className="w-full border p-2 rounded"
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
                  className="w-full border p-2 rounded"
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
                className="w-full border p-2 rounded"
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
              <label className="block text-sm mb-1">Availability Status</label>
              <select
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              >
                <option value="AVAILABLE">Available</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Service"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
