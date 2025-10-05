import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { getToken, parseJwt } from '../utils/auth';

const ProviderReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerId, setProviderId] = useState(null);

  useEffect(() => {
    // Get provider ID from JWT token
    const token = getToken();
    
    if (token) {
      const payload = parseJwt(token);
      
      if (payload && payload.userId) {
        setProviderId(payload.userId);
        fetchReviews(payload.userId);
      } else if (payload && payload.sub) {
        // Fallback: try to get user ID from email
        fetchUserByEmail(payload.sub);
      } else {
        setError('Unable to get user information - no userId or email in token');
        setLoading(false);
      }
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, []);

  const fetchUserByEmail = async (email) => {
    try {
      const response = await api.get('/api/users/me');
      if (response.data && response.data.userId) {
        setProviderId(response.data.userId);
        fetchReviews(response.data.userId);
      } else {
        setError('Unable to get user information from profile');
        setLoading(false);
      }
    } catch (err) {
      setError('Unable to get user information');
      setLoading(false);
    }
  };

  const fetchReviews = async (providerId) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reviews/provider/${providerId}`);
      setReviews(response.data);
    } catch (err) {
      setError(`Failed to load reviews: ${err.response?.data || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={`text-xl ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
        <span className="ml-2 text-sm text-gray-400">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 text-red-300 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Reviews</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            {reviews.length} review{reviews.length !== 1 ? 's' : ''} received
          </div>
          <button
            onClick={() => providerId && fetchReviews(providerId)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
          <p className="text-gray-400">
            Reviews will appear here once customers rate your services.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-[#0F172A] border border-[#1F2937] rounded-lg p-6 hover:bg-[#1F2937] transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  {/* Rating */}
                  {renderStars(review.rating)}
                  
                  {/* Customer Name */}
                  <div className="mt-2 flex items-center text-sm text-gray-400">
                    <span className="mr-2">👤</span>
                    <span>
                      {review.customer?.fullName || `Customer #${review.customer?.userId || 'Unknown'}`}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="mt-1 flex items-center text-sm text-gray-400">
                    <span className="mr-2">📅</span>
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {/* Comment */}
              <div className="mt-4">
                <div className="flex items-start">
                  <span className="mr-2 text-lg">💬</span>
                  <p className="text-white leading-relaxed">{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Summary */}
      {reviews.length > 0 && (
        <div className="bg-[#0F172A] border border-[#1F2937] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Review Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-400">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{reviews.length}</div>
              <div className="text-sm text-gray-400">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-400">4+ Star Reviews</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderReviews;
