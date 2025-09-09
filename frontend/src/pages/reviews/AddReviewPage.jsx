import { useMemo, useState } from 'react';
import api from '../../services/api'; // must point to your Axios instance (baseURL=http://localhost:8080)

export default function AddReviewPage() {
  const [customerId, setCustomerId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // === Placeholder while Booking is NOT implemented ===
  // TODO (enable later when booking is done):
  // 1) Fetch booking by customerId + providerId (and maybe bookingId).
  // 2) Ensure booking.status === "COMPLETED".
  // 3) Only then allow review submission. Otherwise show a warning.
  const canSubmit = useMemo(() => {
    // return hasCompletedBooking && rating > 0 && comment.trim().length > 0;
    return rating > 0 && comment.trim().length > 0; // temporary while booking is not ready
  }, [rating, comment]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!customerId || !providerId) {
      setMsg({ type: 'error', text: 'Customer ID and Provider ID are required.' });
      return;
    }
    if (!canSubmit) {
      setMsg({ type: 'error', text: 'Please select a rating and write a comment.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: Number(customerId),
        providerId: Number(providerId),
        rating,
        comment: comment.trim(),
      };

      await api.post('/api/reviews', payload);

      setMsg({ type: 'success', text: 'Review submitted successfully!' });
      setRating(0);
      setComment('');
      // keep IDs so user can add more reviews quickly
    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit review. Please try again.';
      setMsg({ type: 'error', text: serverMsg });
      console.error('Submit review error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () =>
    [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded p-1"
        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
      >
        <span className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      </button>
    ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add a Review</h1>

        {/* Message */}
        {msg.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              msg.type === 'success'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
              <input
                type="number"
                min="1"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
                          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">booking ID</label>
              <input
                type="number"
                min="1"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Provider ID</label>
              <input
                type="number"
                min="1"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
        

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <div className="flex items-center gap-2">{renderStars()}</div>
            <p className="text-sm text-gray-500 mt-1">
              {rating ? `You selected ${rating} star${rating > 1 ? 's' : ''}.` : 'Click a star.'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comment *</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Booking dependency placeholder (commented) */}
          {/*
            // When booking is ready:
            // if (!hasCompletedBooking) {
            //   return <div className="text-amber-700 bg-amber-50 border border-amber-200 p-4 rounded">
            //     You can only review a provider after a completed booking.
            //   </div>;
            // }
          */}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-indigo-700 hover:to-blue-700 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
