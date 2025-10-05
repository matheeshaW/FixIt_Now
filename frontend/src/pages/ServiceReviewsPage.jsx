import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getProviderReviews } from "../services/api";

export default function ServiceReviewsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { providerId, providerName } = location.state || {};

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!providerId) {
      setError("Missing provider information.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getProviderReviews(providerId);
        setReviews(res.data || []);
      } catch (err) {
        setError(err.response?.data || "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [providerId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const formatDate = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[...Array(5)].map((_, idx) => (
        <span key={idx} className={`text-xl ${idx < rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
      ))}
      <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Provider Reviews</h1>
          <p className="text-gray-500">{providerName ? providerName : `Provider #${providerId || "-"}`}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 transition"
        >
          Back
        </button>
      </div>

      {/* Summary */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-semibold text-yellow-500">{averageRating.toFixed(1)}</div>
            <div>
              <div className="text-gray-800 font-medium">Average rating</div>
              <div className="text-gray-500">⭐ {averageRating.toFixed(1)}/5</div>
            </div>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <div className="text-2xl font-semibold text-gray-800">{reviews.length}</div>
            <div className="text-gray-500">Total reviews</div>
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">Loading reviews…</div>
      )}
      {!!error && !loading && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 mb-4">{error}</div>
      )}
      {!loading && !error && reviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-gray-600">No reviews yet.</div>
      )}

      {/* Reviews list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {reviews.map((r) => (
            <div key={r.reviewId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold text-gray-800">{r.customer?.fullName || "Anonymous"}</div>
                  <div className="text-sm text-gray-500">{formatDate(r.createdAt)}</div>
                </div>
                {renderStars(r.rating || 0)}
              </div>
              <p className="mt-3 text-gray-700 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


