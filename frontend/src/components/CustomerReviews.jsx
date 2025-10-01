import React, { useState, useEffect } from 'react';
import { getToken, parseJwt } from '../utils/auth';
import { getCustomerReviews, updateReview, deleteReview } from '../services/api';
import api from '../services/api';

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get customer ID from JWT token
    const token = getToken();
    
    if (token) {
      const payload = parseJwt(token);
      
      if (payload && payload.userId) {
        setCustomerId(payload.userId);
        fetchReviews(payload.userId);
      } else if (payload && payload.sub) {
        // Fallback: try to get user ID from profile
        fetchUserByEmail(payload.sub);
      } else {
        setError('Unable to get user information');
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
        setCustomerId(response.data.userId);
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

  const fetchReviews = async (customerId) => {
    try {
      setLoading(true);
      const response = await getCustomerReviews(customerId);
      setReviews(response.data);
    } catch (err) {
      setError(`Failed to load reviews: ${err.response?.data || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: '' });
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      await updateReview(editingReview.reviewId, {
        rating: editForm.rating,
        comment: editForm.comment
      });
      
      setMessage('Review updated successfully!');
      setEditingReview(null);
      setEditForm({ rating: 5, comment: '' });
      
      // Refresh the reviews list
      if (customerId) {
        fetchReviews(customerId);
      }
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update review: ${err.response?.data || err.message}`);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      await deleteReview(reviewId);
      setMessage('Review deleted successfully!');
      
      // Refresh the reviews list
      if (customerId) {
        fetchReviews(customerId);
      }
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(`Failed to delete review: ${err.response?.data || err.message}`);
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
        <div className="text-blue-600">Loading your reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-blue-700">My Reviews</h2>
        <div className="text-sm text-blue-600">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">You haven't submitted any reviews yet</h3>
          <p className="text-gray-500">
            Reviews will appear here once you rate completed services.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.reviewId}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              {editingReview && editingReview.reviewId === review.reviewId ? (
                // Edit Form
                <form onSubmit={handleUpdateReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating:
                    </label>
                    <div className="flex mb-4">
                      {[1,2,3,4,5].map(star => (
                        <button
                          type="button"
                          key={star}
                          className={`text-2xl mr-1 ${
                            star <= editForm.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          onClick={() => setEditForm({...editForm, rating: star})}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment:
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editForm.comment}
                      onChange={(e) => setEditForm({...editForm, comment: e.target.value})}
                      required
                      maxLength={1000}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Review Display
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {/* Rating */}
                      {renderStars(review.rating)}
                      
                      {/* Provider Name */}
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <span className="mr-2">👤</span>
                        <span>
                          For Provider: {review.provider?.fullName || `Provider #${review.provider?.userId || 'Unknown'}`}
                        </span>
                      </div>
                      
                      {/* Date */}
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="mr-2">📅</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(review)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.reviewId)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  {/* Comment */}
                  <div className="mt-4">
                    <div className="flex items-start">
                      <span className="mr-2 text-lg">💬</span>
                      <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reviews Summary */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Review Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <div className="text-sm text-gray-600">Average Rating Given</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">4+ Star Reviews</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
