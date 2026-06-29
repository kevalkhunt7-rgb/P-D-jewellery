import React from 'react';
import { Star } from 'lucide-react';

const INDIAN_REVIEWS = [
  { id: 1, name: "Aanya Sharma", rating: 5, tag: "Verified Buyer", location: "Mumbai", comment: "The finish on the gold is absolutely breathtaking. Perfect modern geometric lines and seamless polish!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { id: 2, name: "Rohan Mehta", rating: 5, tag: "Groom", location: "Delhi", comment: "Bought diamond stud earrings for my wife. The BIS hallmark number is authentic. Incredibly great customer service.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { id: 3, name: "Priya Patel", rating: 3, tag: "Bride", location: "Ahmedabad", comment: "Exquisite craftsmanship! The diamond clarity is exactly as stated in the certificate. Truly worth every penny.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
  { id: 4, name: "Ananya Iyer", rating: 4, tag: "Collector", location: "Chennai", comment: "Impressed by the transparent cost breakdown and low making charges. Exceeded all my premium expectations.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
  { id: 5, name: "Kabir Singh", rating: 5, tag: "Verified Buyer", location: "Chandigarh", comment: "Stunning design collection. The net weight matches perfectly with the certificate detail layout.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80" },
  { id: 6, name: "Diya Joshi", rating: 4, tag: "Bride", location: "Pune", comment: "The packaging was luxury tier and shipping was fully insured. Received so many compliments on my special day!", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" }
];

export function AutoReviewSlider() {
  const continuousReviews = [...INDIAN_REVIEWS, ...INDIAN_REVIEWS];

  return (
    <div className="w-full bg-stone-50/40 border-y border-stone-200/30 py-12 overflow-hidden relative select-none">

      {/* Infinite Marquee Slider Engine */}
      <style>{`
                @keyframes inlineMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .custom-slider-track {
                    display: flex;
                    width: max-content;
                    animation: inlineMarquee 35s linear infinite;
                }
                .custom-slider-track:hover {
                    animation-play-state: paused;
                }
            `}</style>

      {/* Title Heading */}
      <div className="container mx-auto px-6 mb-10 text-center">
        <h4 className="text-[11px] font-bold tracking-[0.25em] text-[#B76E79] uppercase mb-1">
          Luxury
        </h4>
        <p className="font-serif text-xl text-stone-800">Words From Our Customers</p>
      </div>

      {/* Slider Container Track */}
      <div className="w-full overflow-hidden pt-4 pb-2">
        <div className="custom-slider-track gap-8 pr-8">
          {continuousReviews.map((review, idx) => (
            <div
              key={`${review.id}-${idx}`}
              className="w-[340px] bg-white rounded-[2rem] border border-stone-100 p-7 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between flex-shrink-0 relative mt-4 mb-2"
            >
              {/* FLOATING CORNER QUOTE BADGE */}
              <div className="absolute -top-4 -left-3 w-10 h-10 rounded-full bg-gradient-to-br from-[#c59b63] via-[#b68a4c] to-[#9e7439] flex items-center justify-center shadow-[0_4px_12px_rgba(183,110,121,0.25)] border border-white/20">
                <span className="text-white font-serif font-bold text-xl leading-none -mt-1 select-none">
                  “
                </span>
              </div>

              {/* UPPER HALF: STAR ROW & TESTIMONIAL COMMENT */}
              <div className="space-y-4">
                {/* Dynamic Star Layout Row */}
                <div className="flex items-center gap-0.5 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating
                          ? "text-[#e2b443] fill-[#e2b443]" // Filled gold star if index is less than rating
                          : "text-stone-200 fill-stone-100"  // Empty grey star for lower ratings (like 4 stars)
                        }`}
                    />
                  ))}
                </div>

                {/* Review Commentary Body */}
                <p className="text-[13px] text-stone-600 leading-relaxed font-normal min-h-[78px] line-clamp-4">
                  "{review.comment}"
                </p>
              </div>

              {/* LOWER HALF: PROFILE ASSIGNMENT SECTION */}
              <div className="border-t border-stone-100 pt-4 mt-5 flex items-center gap-3.5">
                {/* Round Avatar Framed Image Component */}
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-11 h-11 rounded-full object-cover border border-stone-100 bg-stone-50"
                  loading="lazy"
                />

                {/* Identity Block */}
                <div className="flex flex-col">
                  <h5 className="text-[13px] font-bold text-stone-800 tracking-wide">
                    {review.name}
                  </h5>
                  <span className="text-[11px] text-[#B76E79] font-medium mt-0.5">
                    {review.tag || "Verified Buyer"}, {review.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Radial Blur Soft-Shadow Layout Shaders */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#faf9f6] via-[#faf9f6]/30 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#faf9f6] via-[#faf9f6]/30 to-transparent pointer-events-none z-10" />
    </div>
  );
}