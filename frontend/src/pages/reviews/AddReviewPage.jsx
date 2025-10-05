import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../services/api';

const AddReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, providerId, customerId } = location.state || {};
  console.log('AddReviewPage location.state:', location.state);
  console.log('AddReviewPage IDs:', { bookingId, providerId, customerId });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/api/reviews', {
        bookingId,
        providerId,
        customerId,
        rating,
        comment,
      });
      setSuccess(true);
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      setError(err.response?.data || 'Failed to submit review.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Add Review</h2>
      {(!bookingId || !providerId || !customerId) && (
        <div className="text-red-600 mb-2 font-semibold">Error: Missing booking, provider, or customer ID. Please use the Add Review button from your bookings list.</div>
      )}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">Review submitted!</div>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-semibold">Rating:</label>
        <div className="flex mb-4">
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
            >★</button>
          ))}
        </div>
        <label className="block mb-2 font-semibold">Comment:</label>
        <textarea
          className="w-full border rounded p-2 mb-4"
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          maxLength={1000}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >Submit Review</button>
      </form>
    </div>
  );
};

export default AddReviewPage;
