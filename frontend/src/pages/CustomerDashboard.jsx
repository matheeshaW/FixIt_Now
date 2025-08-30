import { useState, useEffect } from "react";
import api from "../services/api";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("browse");
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchProvinces();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get("/api/services"); // all public services
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const filteredServices = services.filter((s) => {
    const categoryMatch = selectedCategory
      ? s.categoryName ===
        categories.find((c) => c.categoryId === Number(selectedCategory))
          ?.categoryName
      : true;

    const provinceMatch = selectedProvince
      ? s.province === selectedProvince
      : true;

    const priceMatch = s.price >= priceRange[0] && s.price <= priceRange[1];

    const availabilityMatch = availabilityFilter
      ? s.availabilityStatus === availabilityFilter
      : true;

    return categoryMatch && provinceMatch && priceMatch && availabilityMatch;
  });

  if (loading) return <div className="max-w-6xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-6">Customer Dashboard</h1>

      {/* Navigation Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("browse")}
          className={`px-4 py-2 font-medium ${
            activeTab === "browse"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Browse Services
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`px-4 py-2 font-medium ${
            activeTab === "favorites"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Favorites
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Browse Tab */}
      {activeTab === "browse" && (
        <div className="space-y-6">
          <div className="bg-white rounded shadow p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">Filters</h2>
            <div className="flex flex-wrap gap-4 items-end">
              {/* Category Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border p-2 rounded w-48"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Province Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Province</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="border p-2 rounded w-48"
                >
                  <option value="">All Provinces</option>
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Price</label>
                <select
                  value={JSON.stringify(priceRange)}
                  onChange={(e) => setPriceRange(JSON.parse(e.target.value))}
                  className="border p-2 rounded w-48"
                >
                  <option value="[0,500000]">All</option>
                  <option value="[0,2000]">Rs.0 - Rs.2,000</option>
                  <option value="[2000,5000]">Rs.2,000 - Rs.5,000</option>
                  <option value="[5000,10000]">Rs.5,000 - Rs.10,000</option>
                  <option value="[10000,20000]">Rs.10,000 - Rs.20,000</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Availability</label>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="border p-2 rounded w-40"
                >
                  <option value="">All</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="UNAVAILABLE">Unavailable</option>
                </select>
              </div>
              {/* Reset Filters Button */}
              <div className="flex flex-col">
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedProvince("");
                    setPriceRange([0, 500000]);
                    setAvailabilityFilter("");
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Services List */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Services</h2>
            {filteredServices.length === 0 ? (
              <p className="text-gray-500">No services available.</p>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
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
                    <div className="mt-4 flex gap-2">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Book Now
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700">
                        Add to Favorites
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-semibold mb-4">My Favorite Services</h2>
          <p className="text-gray-500">Feature coming soon...</p>
        </div>
      )}
    </div>
  );
}
