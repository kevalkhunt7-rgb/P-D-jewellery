import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sophia Martinez',
    role: 'Bride, New York',
    image: 'https://images.unsplash.com/photo-1581841064838-a470c740e8ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    text: 'The bridal collection exceeded all my expectations! The craftsmanship is stunning, and I received so many compliments on my wedding day. Absolutely worth every penny.',
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Fashion Blogger',
    image: 'https://images.unsplash.com/photo-1675881149187-8faaf934e14a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    text: 'LUMIÈRE has become my go-to for elegant jewelry. The quality is exceptional for imitation pieces, and the designs are incredibly sophisticated. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Olivia Chen',
    role: 'Corporate Executive',
    image: 'https://images.unsplash.com/photo-1581841064838-a470c740e8ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    text: 'Perfect for everyday luxury! The pieces are elegant enough for boardroom meetings yet affordable. Customer service is outstanding too.',
    rating: 5,
  },
];

export function Testimonials() {
  const fallbackAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";

  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FAF9F6] overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span
            className="inline-block px-4 py-2 rounded-full bg-[#FFE5E8]/50 mb-4"
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#B76E79',
              letterSpacing: '0.1em',
            }}
          >
            TESTIMONIALS
          </span>
          <h2
            className="font-serif mb-4"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3.5rem)',
              fontWeight: 700,
              color: '#2C2C2C',
            }}
          >
            What Our Customers Say
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
            Join thousands of happy customers who trust LUMIÈRE for their jewelry needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="luxury-testimonial-card group relative bg-white rounded-3xl p-8 shadow-lg transition-all duration-500"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '1.5rem',
                position: 'relative'
              }}
            >
              {/* Quote Icon */}
              <div 
                className="absolute top-0 left-0 -translate-x-2 -translate-y-2 w-12 h-12 bg-gradient-to-br from-[#B76E79] to-[#D4AF37] rounded-full flex items-center justify-center shadow-xl z-10"
                style={{
                  background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                  boxShadow: '0 10px 25px -5px rgba(183, 110, 121, 0.4)'
                }}
              >
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p
                className="mb-6"
                style={{
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  color: '#2C2C2C',
                  opacity: 0.8,
                  margin: '0 0 24px 0'
                }}
              >
                "{testimonial.text}"
              </p>

              {/* Customer Info Box */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-100" style={{ borderTop: '1px solid #f3f4f6' }}>
                <div 
                  className="rounded-full overflow-hidden ring-2 ring-[#B76E79]/20"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = fallbackAvatar;
                    }}
                  />
                </div>
                <div>
                  <h4
                    className="font-medium"
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      color: '#2C2C2C',
                      fontWeight: 600
                    }}
                  >
                    {testimonial.name}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      color: '#B76E79',
                    }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>

              {/* Decorative gradient border outline on hover via absolute placement */}
              <div 
                className="gradient-border-overlay absolute inset-0 rounded-3xl pointer-events-none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '1.5rem',
                  border: '2px solid transparent',
                  opacity: 0,
                  transition: 'opacity 0.5s ease',
                  zIndex: 1
                }}
              />
            </div>
          ))}
        </div>

        {/* Trust Badges Footer Area */}
        <div 
          className="flex flex-wrap justify-center items-center gap-8 mt-16 pt-12"
          style={{ borderTop: '1px solid #e5e7eb' }}
        >
          <div className="text-center min-w-[120px]">
            <div className="font-serif text-[#B76E79]" style={{ fontSize: '2rem', fontWeight: 700 }}>
              10,000+
            </div>
            <div style={{ fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7 }}>Happy Customers</div>
          </div>
          
          <div className="w-px h-12 bg-gray-200 hidden sm:block" style={{ backgroundColor: '#e5e7eb', width: '1px', height: '48px' }} />
          
          <div className="text-center min-w-[120px]">
            <div className="font-serif text-[#B76E79]" style={{ fontSize: '2rem', fontWeight: 700 }}>
              4.9/5
            </div>
            <div style={{ fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7 }}>Average Rating</div>
          </div>
          
          <div className="w-px h-12 bg-gray-200 hidden sm:block" style={{ backgroundColor: '#e5e7eb', width: '1px', height: '48px' }} />
          
          <div className="text-center min-w-[120px]">
            <div className="font-serif text-[#B76E79]" style={{ fontSize: '2rem', fontWeight: 700 }}>
              98%
            </div>
            <div style={{ fontSize: '0.875rem', color: '#2C2C2C', opacity: 0.7 }}>Satisfaction Rate</div>
          </div>
        </div>

      </div>

      {/* Embedded High-Performance CSS Transitions */}
      <style>{`
        .luxury-testimonial-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease !important;
        }
        .luxury-testimonial-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1) !important;
        }
        .luxury-testimonial-card:hover .gradient-border-overlay {
          opacity: 1 !important;
          border-image: linear-gradient(135deg, #B76E79 0%, #D4AF37 100%) 1;
          border-radius: 1.5rem;
        }
      `}</style>
    </section>
  );
}