import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Review APIs
export const addReview = (data) => api.post('/api/reviews', data);
export const getProviderReviews = (providerId) => api.get(`/api/reviews/provider/${providerId}`);
export const getCustomerReviews = (customerId) => api.get(`/api/reviews/customer/${customerId}`);
export const getAllReviews = () => api.get('/api/reviews');

export default api;
