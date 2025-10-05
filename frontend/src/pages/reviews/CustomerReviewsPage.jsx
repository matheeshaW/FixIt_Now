import React, { useEffect, useState } from 'react';
import axios from '../../services/api';

const CustomerReviewsPage = ({ customerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`/api/reviews/customer/${customerId}`);
        setReviews(res.data);
      } catch (err) {
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [customerId]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">My Submitted Reviews</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && reviews.length === 0 && <div>No reviews yet.</div>}
      <ul>
        {reviews.map(r => (
          <li key={r.reviewId} className="mb-4 border-b pb-2">
            <div className="flex items-center mb-1">
              {[...Array(r.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-xl">★</span>)}
              {[...Array(5 - r.rating)].map((_, i) => <span key={i} className="text-gray-300 text-xl">★</span>)}
            </div>
            <div className="text-gray-700 mb-1">{r.comment}</div>
            <div className="text-xs text-gray-500">For Provider #{r.provider?.userId} on {new Date(r.createdAt).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerReviewsPage;
