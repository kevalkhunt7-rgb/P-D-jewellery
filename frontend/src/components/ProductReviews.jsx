import React, { useState, useEffect } from 'react';
import { Star, Camera, X, Loader2, User, CheckCircle2, Maximize2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null); // Lightbox state

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get(`/reviews/product/${productId}`);
        if (data.success) {
          setReviews(data.reviews);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        toast.error('Could not load client reflections');
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId]);

  // Derived Summary Data
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews)
    : 0;

  // Calculate distribution percentages for 5 down to 1 stars
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return {
      stars,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
      count
    };
  });

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-800">
        <Loader2 className="w-5 h-5 animate-spin stroke-[1.5]" />
        <span className="text-[10px] tracking-widest uppercase font-medium">Curating Reflections...</span>
      </div>
    );
  }

  return (
    <div className="mt-24  rounded-xl pb-5 border-t border-stone-200/60 pt-16 max-w-6xl mx-auto px-4">
      {/* Header Section */}
      <div className="text-center md:text-left mb-12">
        <h2 className="font-serif text-3xl tracking-wide text-stone-900">Client Reflections</h2>
        <p className="text-xs text-white-400 mt-2 uppercase tracking-[0.25em]">Authentic experiences from our Users</p>
      </div>

      {totalReviews === 0 ? (
        <div className="py-20 text-center bg-stone-50/50 backdrop-blur-sm rounded-2xl border border-stone-200/40 max-w-2xl mx-auto">
          <p className="text-stone-800 font-serif italic text-base">No reflections have been shared for this piece yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* Left Column: Breakdown Summary Sticky Dashboard */}
          <div className="lg:sticky lg:top-8 bg-white/40 border border-stone-200/50 p-6 rounded-2xl backdrop-blur-sm">
            <h3 className="font-serif text-lg text-stone-800 mb-4">Aesthetic Rating</h3>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-serif text-stone-900">{averageRating.toFixed(1)}</span>
              <span className="text-stone-800 text-sm">/ 5.0</span>
            </div>
            
            <div className="flex text-[#D4AF37] mb-6">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(averageRating) ? 'fill-current' : 'text-stone-200'}`} 
                />
              ))}
              <span className="text-xs text-stone-500 ml-2 font-sans">({totalReviews} verified reviews)</span>
            </div>

            {/* Distribution Bars */}
            <div className="space-y-2.5">
              {ratingDistribution.map((dist) => (
                <div key={dist.stars} className="flex items-center gap-3 text-xs text-stone-600">
                  <span className="w-3 text-right">{dist.stars}</span>
                  <Star className="w-3 h-3 text-[#D4AF37] fill-current shrink-0" />
                  <div className="flex-1 h-1 bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-stone-800 rounded-full transition-all duration-500"
                      style={{ width: `${dist.percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-stone-800 font-mono">{Math.round(dist.percentage)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Reviews Feed Stream */}
          <div className="lg:col-span-2 space-y-6">
            {reviews.map((review) => (
              <div 
                key={review._id} 
                className="bg-white/70 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-stone-200/40 shadow-sm hover:shadow-md/50 transition-shadow duration-300"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-stone-100/80 flex items-center justify-center text-stone-800 border border-stone-200/40 shrink-0">
                      <User className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h4 className="font-serif text-stone-900 font-medium text-base">{review.user?.name || review.name}</h4>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-800 uppercase tracking-widest mt-1">
                        {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Review Stars */}
                  <div className="flex text-[#D4AF37] bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-100">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-stone-200'}`} />
                    ))}
                  </div>
                </div>

                <p className="text-stone-600 font-serif leading-relaxed mb-6 italic text-base">
                  "{review.comment}"
                </p>

                {/* Review Gallery Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {review.images.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-stone-200/60 shadow-sm group relative cursor-zoom-in"
                        onClick={() => setActiveImage(img.url)}
                      >
                        <img 
                          src={img.url} 
                          alt={`User reflection ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Elegant Lightbox Modal Overlay */}
      {activeImage && (
        <div 
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300 animate-fade-in"
          onClick={() => setActiveImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-stone-800 hover:text-white p-2 rounded-full transition-colors bg-white/5 backdrop-blur"
            onClick={() => setActiveImage(null)}
            aria-label="Close interactive modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()}>
            <img 
              src={activeImage} 
              alt="Blown up view of client reflection gallery element" 
              className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}