import { useState } from 'react';
import api from '../services/api';

export default function SubmitReviewPage() {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState('');
	const [customerId, setCustomerId] = useState(1);
	const [providerId, setProviderId] = useState(2);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState({ type: '', text: '' });

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (rating === 0) {
			setMessage({ type: 'error', text: 'Please select a rating' });
			return;
		}

		if (!comment.trim()) {
			setMessage({ type: 'error', text: 'Please write a review comment' });
			return;
		}

		setIsSubmitting(true);
		setMessage({ type: '', text: '' });

		try {
			const reviewData = {
				customerId: parseInt(customerId),
				providerId: parseInt(providerId),
				rating: rating,
				comment: comment.trim()
			};

			await api.post('/api/reviews', reviewData);
			
			setMessage({ type: 'success', text: 'Review submitted successfully!' });
			setRating(0);
			setComment('');
		} catch (error) {
			console.error('Error submitting review:', error);
			setMessage({ 
				type: 'error', 
				text: error.response?.data?.message || 'Failed to submit review. Please try again.' 
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStars = () => {
		return [1, 2, 3, 4, 5].map((star) => (
			<button
				key={star}
				type="button"
				onClick={() => setRating(star)}
				onMouseEnter={() => setHoverRating(star)}
				onMouseLeave={() => setHoverRating(0)}
				className="text-3xl transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full p-1"
			>
				<span className={star <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'}>
					★
				</span>
			</button>
		));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
			<div className="max-w-2xl mx-auto">
				<div className="bg-white rounded-2xl shadow-xl p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold text-gray-800 mb-2">Submit Review</h1>
						<p className="text-gray-600">Share your experience with our service</p>
					</div>

					{/* Message Display */}
					{message.text && (
						<div className={`mb-6 p-4 rounded-lg ${
							message.type === 'success' 
								? 'bg-green-100 text-green-800 border border-green-200' 
								: 'bg-red-100 text-red-800 border border-red-200'
						}`}>
							{message.text}
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* ID Fields */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Customer ID
								</label>
								<input
									type="number"
									value={customerId}
									onChange={(e) => setCustomerId(e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									min="1"
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Provider ID
								</label>
								<input
									type="number"
									value={providerId}
									onChange={(e) => setProviderId(e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
									min="1"
									required
								/>
							</div>
						</div>

						{/* Star Rating */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								Rating *
							</label>
							<div className="flex justify-center space-x-2">
								{renderStars()}
							</div>
							<div className="text-center mt-2">
								<span className="text-sm text-gray-500">
									{rating > 0 ? `You selected ${rating} star${rating > 1 ? 's' : ''}` : 'Click to select rating'}
								</span>
							</div>
						</div>

						{/* Comment Textarea */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Review Comment *
							</label>
							<textarea
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								rows="4"
								placeholder="Share your experience, feedback, or suggestions..."
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
								required
							/>
						</div>

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isSubmitting}
							className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center">
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
									Submitting...
								</div>
							) : (
								'Submit Review'
							)}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
