import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiEye, FiThumbsUp, FiThumbsDown } from "react-icons/fi";

const StarRating = ({ rating }) => (
  <div className="flex gap-0.5 text-xs">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`${
          star <= rating ? "text-amber-500" : "text-slate-700"
        }`}
      >
        ★
      </span>
    ))}
  </div>
);

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get("/reviews/all");
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const totalReviews = reviews.length;
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const pendingReviews = reviews.filter(r => !r.isApproved).length;
  const fiveStarReviews = reviews.filter(r => r.rating === 5).length;

  // Quick inline actions handling logic
  const updateStatus = async (id, newStatus) => {
    // Implement update review status if needed
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Title block */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reviews</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage customer reviews and ratings</p>
      </div>

      {/* Analytics Summary Stats Grid Dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Reviews", value: totalReviews, dynamic: null },
          { 
            label: "Average Rating", 
            value: avgRating, 
            dynamic: <StarRating rating={Math.round(Number(avgRating))} /> 
          },
          { label: "Pending Review", value: pendingReviews },
          { label: "5 Star Reviews", value: fiveStarReviews },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">{stat.label}</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-bold text-white tracking-tight">{stat.value}</p>
              {stat.dynamic}
            </div>
          </div>
        ))}
      </div>

      {/* Primary Customer Workspace Table Box */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-bold text-white tracking-wide">Recent Reviews</h2>
        </div>

        {/* Data Stream Layout Viewport */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Customer</th>
                <th className="py-3 px-4 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">Rating</th>
                <th className="py-3 px-4 font-medium">Comment</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {reviews.map((review) => (
                <tr key={review._id} className="hover:bg-slate-800/10 transition-colors">
                  
                  {/* User Profile Avatar Block Column */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-slate-800 border border-slate-700/60 flex items-center justify-center flex-shrink-0">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.user?.name || 'User')}`}
                          alt={review.user?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <span className="absolute text-[10px] font-bold text-slate-300 tracking-tight">
                          {getInitials(review.user?.name)}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-200">{review.user?.name || 'Guest'}</span>
                    </div>
                  </td>

                  {/* Targeted Product Info Block */}
                  <td className="py-3.5 px-4">
                    <span className="text-slate-300 font-medium truncate max-w-[150px] inline-block">
                      {review.product?.name || 'Deleted Product'}
                    </span>
                  </td>

                  {/* Numerical Data Summary */}
                  <td className="py-3.5 px-4">
                    <StarRating rating={review.rating} />
                  </td>

                  {/* Review text content truncation row */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="text-slate-400 line-clamp-1 italic leading-relaxed">
                      "{review.comment}"
                    </p>
                  </td>

                  {/* Join Date Block */}
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>

                  {/* Status Badges Context */}
                  <td className="py-3.5 px-4">
                    {review.isApproved ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                        Pending
                      </span>
                    )}
                  </td>

                  {/* Action Handlers */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        title="View Full Context"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      
                      {review.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(review.id, "approved")}
                            className="p-1.5 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Approve Review"
                          >
                            <FiThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateStatus(review.id, "rejected")}
                            className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Reject Review"
                          >
                            <FiThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}