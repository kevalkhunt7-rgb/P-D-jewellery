import React from 'react';
import {  Heart, MessageCircle } from 'lucide-react';
import { FiInstagram } from "react-icons/fi";

const instagramPosts = [
  {
    image: 'https://images.unsplash.com/photo-1611583027838-515a1087afdb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 1234,
    comments: 89,
  },
  {
    image: 'https://images.unsplash.com/photo-1583937443325-97becde478a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 2156,
    comments: 124,
  },
  {
    image: 'https://images.unsplash.com/photo-1615197419962-90f21da0956d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 1876,
    comments: 97,
  },
  {
    image: 'https://images.unsplash.com/photo-1633810543462-77c4a3b13f07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 1543,
    comments: 76,
  },
  {
    image: 'https://images.unsplash.com/photo-1525740664269-1bb17f251737?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 2987,
    comments: 156,
  },
  {
    image: 'https://images.unsplash.com/photo-1605821628253-8120cd950c03?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    likes: 1987,
    comments: 103,
  },
];

export function InstagramGallery() {
  const imageFallback = "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&auto=format&fit=crop&q=60";

  return (
    <section className="py-20 bg-gradient-to-b from-[#FAF9F6] to-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#B76E79]/10 to-[#D4AF37]/10 mb-4">
            <FiInstagram  className="w-5 h-5 text-[#B76E79]" />
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#B76E79',
                letterSpacing: '0.1em',
              }}
            >
              @PD_LUXURY_JEWELLERY
            </span>
          </div>
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#2C2C2C',
            }}
          >
            Follow Our Journey
          </h2>
          <p
            className="max-w-2xl mx-auto"
            style={{
              fontSize: '1.125rem',
              lineHeight: 1.8,
              color: '#2C2C2C',
              opacity: 0.7,
            }}
          >
            Join our community and get inspired by the latest trends, styling tips, and behind-the-scenes moments
          </p>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post, index) => (
            <div
              key={index}
              className="insta-gallery-card relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl"
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                borderRadius: '1rem',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <img
                src={post.image}
                alt={`Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = imageFallback;
                }}
              />

              {/* Interaction Overlay on hover */}
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6"
                style={{ position: 'absolute', inset: 0 }}
              >
                <div className="flex items-center gap-4 text-white" style={{ color: '#ffffff' }}>
                  <div className="flex items-center gap-1">
                    <Heart className="w-5 h-5 text-white fill-white" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {post.likes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-5 h-5 text-white" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Top-Right Instagram Icon */}
              <div 
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm"
                style={{ position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px', borderRadius: '50%' }}
              >
                <FiInstagram  className="w-4 h-4 text-[#B76E79]" />
              </div>

              {/* Shimmer overlay layer triggered by card hover */}
              <div className="shimmer-sweep-element absolute inset-0 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Call to Action Button */}
        <div className="text-center mt-12">
          <button
            className="insta-cta-btn inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium tracking-wide shadow-lg hover:shadow-xl cursor-pointer border-0"
            style={{
              background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
              color: 'white',
              fontSize: '1rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <FiInstagram  className="w-5 h-5" />
            Follow @pd_luxury_jewellery
          </button>
        </div>

      </div>

      {/* Embedded Vanilla CSS Animation Bridge */}
      <style>{`
        .insta-gallery-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, z-index 0s !important;
        }
        .insta-gallery-card:hover {
          transform: scale(1.05);
          z-index: 10;
        }
        .shimmer-sweep-element {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-100%);
          width: 100%;
          height: 100%;
        }
        .insta-gallery-card:hover .shimmer-sweep-element {
          animation: sweepAnimation 0.85s ease-out forwards;
        }
        .insta-cta-btn {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease !important;
        }
        .insta-cta-btn:hover {
          transform: scale(1.04);
        }
        .insta-cta-btn:active {
          transform: scale(0.97);
        }
        @keyframes sweepAnimation {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}