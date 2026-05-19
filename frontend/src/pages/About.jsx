import React, { useEffect } from 'react';
import { 
  Sparkles, Award, Shield, Heart, Gem, Gift, 
   ArrowRight, CheckCircle2, ShoppingBag, Eye
} from 'lucide-react';
import { FiInstagram } from "react-icons/fi";

function AboutPage() {
  
  // Smooth scroll trigger simulation hook
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleIntersect = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-visible');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FDF8F3] relative overflow-hidden font-sans text-[#2C2C2C] selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C]">
      
      {/* GLOBAL LUXURY AMBIENT BACKGROUNDS */}
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-[#FFF0EB] via-[#E8C7B7]/10 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-[#D4AF37]/5 via-[#FFF0EB] to-transparent blur-[180px] pointer-events-none" />
      <div className="absolute bottom-[5%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tr from-[#E8C7B7]/15 to-transparent blur-[140px] pointer-events-none" />

      {/* FLOATING GOLD DUST PARTICLES */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-25 luxury-dust-float"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${16 + Math.random() * 12}s`
            }}
          />
        ))}
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#2C2C2C]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#2C2C2C]/30 to-[#FDF8F3] z-10" />
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1800" 
          alt="Cinematic Female Fashion Model" 
          className="absolute inset-0 w-full h-full object-cover opacity-75 animate-luxury-zoom scale-105"
        />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 animate-subtle-slide-down">
            <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[#E8C7B7] font-semibold">The Atelier Story</span>
          </div>
          <h1 className="font-serif text-white text-4xl sm:text-6xl md:text-7xl font-light tracking-wide leading-tight mb-6">
            Crafting Elegance <br />
            <span className="italic text-[#FFF0EB] font-normal font-serif">For Every Woman</span>
          </h1>
          <p className="text-white/80 font-light text-sm sm:text-lg tracking-wide max-w-2xl leading-relaxed animate-fade-in-delayed">
            We redefine the world of high-end imitation jewelry. Our creations embrace the uncompromising brilliance of royal heirlooms, rearchitected for the modern muse.
          </p>
          <div className="mt-10 animate-fade-in-delayed">
            <a href="#story" className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#E8C7B7] to-[#D4AF37] text-white text-xs font-semibold uppercase tracking-widest rounded-full shadow-[0_10px_30px_rgba(232,199,183,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
              Explore Our Heritage <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* Bottom soft ambient boundary element */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FDF8F3] to-transparent z-20" />
      </section>


      {/* 2. BRAND STORY SECTION */}
      <section id="story" className="py-24 px-4 container mx-auto max-w-[1300px] relative z-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          <div className="col-span-12 lg:col-span-6 relative reveal-on-scroll reveal-fade-left">
            <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-[#E8C7B7]/40 rounded-tl-[3rem]" />
            <div className="rounded-[3rem] overflow-hidden shadow-[0_30px_60px_rgba(44,44,44,0.06)] bg-[#2C2C2C] aspect-[3/4]">
              <img 
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=800" 
                alt="Fine Jewelry Artisanal Styling" 
                className="w-full h-full object-cover opacity-90 transition-transform duration-[6000ms] hover:scale-105"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-[3rem]" />
          </div>

          <div className="col-span-12 lg:col-span-6 space-y-8 reveal-on-scroll reveal-fade-right">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-[0.25em] text-[#B76E79] font-bold block">Born from Passion</span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#2C2C2C] font-light tracking-wide leading-tight">
                An Evolution of <span className="italic font-normal text-[#B76E79]">Aesthetic Perfection</span>
              </h2>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl p-8 rounded-3xl border border-white shadow-[0_20px_50px_rgba(232,199,183,0.1)] space-y-6">
              <p className="text-sm sm:text-base text-[#2C2C2C]/80 leading-relaxed font-light">
                Founded with a visionary purpose, our atelier was built to dismantle the barrier between high couture design and approachability. We believe that a woman’s radiance shouldn’t depend on a price tag, but on the soul of the craftsmanship she wears.
              </p>
              <p className="text-sm sm:text-base text-[#2C2C2C]/80 leading-relaxed font-light">
                Every stone is hand-selected, every curve hand-carved, utilizing premium composite materials that mimic the light dispersion patterns of flawless diamonds and natural precious gemstones.
              </p>
            </div>

            <blockquote className="border-l-4 border-[#E8C7B7] pl-4 italic text-base text-[#2C2C2C]/70 font-serif">
              "True luxury is not defined by cost, but by the emotion elicited when a piece touches your skin."
            </blockquote>
          </div>

        </div>
      </section>


      {/* 3. OUR MISSION SECTION */}
      <section className="py-20 bg-gradient-to-b from-transparent via-[#FFF0EB]/30 to-transparent relative z-20">
        <div className="container mx-auto max-w-[1300px] px-4 text-center">
          <div className="max-w-2xl mx-auto mb-16 space-y-3 reveal-on-scroll">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-bold block">The Atelier Philosophy</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2C2C] font-light tracking-wide">Our Core Values</h2>
            <div className="w-16 h-[1px] bg-[#E8C7B7] mx-auto mt-4" />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Elegance", icon: Sparkles, desc: "Sculpting pristine architectural symmetries that flatter the feminine silhouette flawlessly." },
              { title: "Confidence", icon: Award, desc: "Empowering every woman to stand tall, commanding the room with unmatched statement brilliance." },
              { title: "Craftsmanship", icon: Gem, desc: "Utilizing 18k rose gold plating and ultra-refractive cubic structures standard to master ateliers." },
              { title: "Affordable Luxury", icon: ShoppingBag, desc: "Delivering the breathless prestige of premium visual weight without the fine jewelry liability." }
            ].map((value, idx) => (
              <div key={idx} className="bg-white/70 backdrop-blur-md p-8 rounded-3xl border border-white hover:border-[#E8C7B7]/60 shadow-[0_15px_40px_rgba(44,44,44,0.02)] hover:shadow-[0_20px_50px_rgba(232,199,183,0.15)] transition-all duration-500 group text-center reveal-on-scroll">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center text-[#B76E79] mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <value.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#2C2C2C] mb-3 tracking-wide">{value.title}</h3>
                <p className="text-xs sm:text-sm text-[#2C2C2C]/60 leading-relaxed font-light">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 4. CRAFTSMANSHIP SHOWCASE (HORIZONTAL VISUAL RUNWAY) */}
      <section className="py-24 px-4 overflow-hidden relative z-20">
        <div className="container mx-auto max-w-[1300px] mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B76E79] font-bold block">Behind The Shimmer</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#2C2C2C] font-light tracking-wide">The Art of the Forge</h2>
          </div>
          <p className="text-[#2C2C2C]/60 font-light text-sm max-w-md leading-relaxed">
            Take a look into our microscopic setting chambers where computational symmetry meets human mastery.
          </p>
        </div>

        {/* Gallery Runway Wrapper */}
        <div className="w-full overflow-x-auto luxury-scrollbar py-6">
          <div className="flex gap-8 px-4 lg:px-12 w-max">
            {[
              { tag: "01 / Laser Carving", name: "Micro-Prism Diamond Cut", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500" },
              { tag: "02 / Alloy Bonding", name: "18k Champagne Flawless Polish", img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500" },
              { tag: "03 / Prong Assembly", name: "Hand-Set Matrix Crown Claws", img: "https://images.unsplash.com/photo-1630019852942-f89202989a59?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500" },
              { tag: "04 / Finishing", name: "Anti-Tarnish Hypoallergenic Seal", img: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500" }
            ].map((item, idx) => (
              <div key={idx} className="w-[280px] sm:w-[360px] bg-white/80 p-4 rounded-[2rem] border border-white shadow-sm group hover:shadow-lg transition-all duration-500">
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-[#FDF8F3]">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[4000ms] mix-blend-multiply" />
                </div>
                <span className="text-[10px] font-bold text-[#B76E79] tracking-widest uppercase">{item.tag}</span>
                <h4 className="font-serif text-base font-medium text-[#2C2C2C] mt-1 tracking-wide">{item.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 5. WHY CHOOSE US SECTION */}
      <section className="py-24 bg-white/40 border-y border-[#E8C7B7]/20 backdrop-blur-md relative z-20">
        <div className="container mx-auto max-w-[1300px] px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-bold block">The Luxury Standard</span>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2C2C] font-light tracking-wide">Uncompromising Standards</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Premium Quality Realism", desc: "Our laboratory structures share identical visual reflectivity parameters with top-tier mining gemstones." },
              { title: "Hypoallergenic Selection", desc: "Completely zero lead, nickel, or reactive alloys. Engineered to protect your delicate skin indefinitely." },
              { title: "Bridal Suite Allocations", desc: "Exclusive matching luxury sets designed specifically for major grand scale wedding occasions." },
              { title: "Premium Concierge Delivery", desc: "Every parcel leaves tracked and fully insured under high-security courier transport networks." },
              { title: "Satin Ribbon Packaging", desc: "Unboxing layout utilizes structured rigid boxes lined with high-density premium micro-satin sheets." },
              { title: "Trend-Driven Curations", desc: "Updated systematically side-by-side with international dynamic Parisian fashion week drops." }
            ].map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white/70 rounded-2xl border border-white/60 shadow-sm reveal-on-scroll">
                <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-semibold tracking-wide text-[#2C2C2C]">{feature.title}</h4>
                  <p className="text-xs sm:text-sm text-[#2C2C2C]/60 leading-relaxed font-light">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 6. CUSTOMER EXPERIENCE SECTION (EMOTIONAL TESTIMONIALS) */}
      <section className="py-24 container mx-auto max-w-[1300px] px-4 relative z-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          <div className="col-span-12 lg:col-span-5 space-y-6 reveal-on-scroll">
            <span className="text-xs uppercase tracking-[0.25em] text-[#B76E79] font-bold block">Lounge Voices</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#2C2C2C] font-light tracking-wide leading-tight">
              Shared Moments of <span className="italic font-normal text-[#B76E79]">Pure Brilliance</span>
            </h2>
            <p className="text-[#2C2C2C]/60 font-light text-sm sm:text-base leading-relaxed">
              Discover how women around the globe conquer galas, high corporate keynotes, and milestone celebrations with our statements.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {[
              { text: "I wore the Empress choker layout to a gala fundraiser. Everyone assumed it was a generational asset assignment. The heavy real-weight drape is remarkable.", author: "Vivienne S.", location: "London" },
              { text: "My skin reacts instantly to cheap fashion alloys. This jewelry layer is perfectly sterile, lightweight, and shines brightly after continuous wear.", author: "Elena R.", location: "New York" }
            ].map((review, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-[#FFF0EB]/30 p-8 rounded-3xl border border-white shadow-[0_15px_40px_rgba(44,44,44,0.02)] flex flex-col justify-between space-y-6 reveal-on-scroll">
                <p className="text-xs sm:text-sm text-[#2C2C2C]/80 italic leading-relaxed font-light">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#E8C7B7]/20">
                  <div className="w-8 h-8 rounded-full bg-[#E8C7B7]/30 flex items-center justify-center font-serif text-xs font-bold text-[#B76E79]">{review.author[0]}</div>
                  <div>
                    <h5 className="text-xs font-semibold text-[#2C2C2C]">{review.author}</h5>
                    <p className="text-[10px] text-[#2C2C2C]/40 tracking-wider uppercase">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 7. LUXURY PACKAGING SECTION */}
      <section className="py-24 bg-[#2C2C2C] relative overflow-hidden rounded-[3rem] mx-4 my-12 shadow-[0_40px_80px_rgba(0,0,0,0.15)]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1512909006721-3d6018887383?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200" 
          alt="Luxury Unboxing Silk Box" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40 scale-105"
        />

        <div className="relative z-20 container mx-auto max-w-[1100px] px-6 py-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 reveal-on-scroll">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#E8C7B7] font-semibold">The Presentation</span>
            </div>
            <h2 className="font-serif text-white text-3xl sm:text-5xl font-light tracking-wide leading-tight">
              An Unboxing Experience <span className="italic text-[#FFF0EB]">Wrapped in Silk</span>
            </h2>
            <p className="text-white/70 font-light text-xs sm:text-sm leading-relaxed max-w-md">
              Every creation arrives ensconced in our signatures: magnetic deep charcoal hardcases, cushioned dense micro-velvet liners, and protective envelopes sealed by weighted custom gold wax emblem stamps.
            </p>
          </div>
          <div className="flex justify-center reveal-on-scroll">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl max-w-xs transform hover:rotate-2 transition-transform duration-500">
              <div className="bg-[#FAF6F0] p-8 rounded-xl text-center shadow-inner">
                <Gem className="w-8 h-8 text-[#D4AF37] mx-auto mb-4 animate-bounce" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#B76E79] font-bold block mb-1">Atelier Protection</span>
                <p className="font-serif text-xs text-[#2C2C2C] italic font-light">"Protected. Insured. Preserved."</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 8. INSTAGRAM / SOCIAL GALLERY (MASONRY RUNWAY) */}
      <section className="py-24 container mx-auto max-w-[1300px] px-4 relative z-20">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <FiInstagram className="w-5 h-5 text-[#B76E79] mx-auto mb-2" />
          <span className="text-xs uppercase tracking-[0.25em] text-[#B76E79] font-bold block">The Runway Curation</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-[#2C2C2C] font-light tracking-wide">Captured on the Loom</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500", span: "col-span-1" },
            { img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500", span: "col-span-1" },
            { img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500", span: "col-span-1" },
            { img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=500", span: "col-span-1" }
          ].map((item, idx) => (
            <div key={idx} className={`${item.span} group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm bg-[#2C2C2C] cursor-pointer`}>
              <img src={item.img} alt="Social fashion visual lookup" className="w-full h-full object-cover opacity-90 transition-transform duration-[3000ms] group-hover:scale-105 group-hover:opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 z-10">
                <span className="text-white text-xs tracking-widest font-medium uppercase inline-flex items-center gap-1.5">
                  View Look <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* 9. NEWSLETTER SECTION */}
      <section className="py-20 bg-gradient-to-b from-transparent to-[#FFF0EB]/40 border-t border-[#E8C7B7]/20 relative z-20">
        <div className="container mx-auto max-w-[800px] px-4 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold block">The Sovereign Registry</span>
            <h2 className="font-serif text-3xl sm:text-5xl text-[#2C2C2C] font-light tracking-wide">Join Our World of Elegance</h2>
            <p className="text-xs sm:text-sm text-[#2C2C2C]/50 max-w-md mx-auto leading-relaxed">
              Subscribe to unlock allocation notices on limited runway duplicates, private boutique drops, and historical lookbooks.
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-center">
            <input 
              type="email" 
              placeholder="Your email correspondence" 
              className="w-full px-5 py-3.5 bg-white/60 backdrop-blur-md border border-[#E8C7B7]/40 rounded-full text-xs text-[#2C2C2C] placeholder-[#2C2C2C]/40 focus:outline-none focus:border-[#B76E79] shadow-inner transition-colors"
              required
            />
            <button type="submit" className="w-full sm:w-auto whitespace-nowrap px-8 py-3.5 bg-gradient-to-r from-[#E8C7B7] via-[#B76E79] to-[#D4AF37] text-white text-xs font-semibold uppercase tracking-widest rounded-full hover:shadow-[0_10px_25px_rgba(183,110,121,0.3)] transition-all transform active:scale-95 duration-300">
              Request Entry
            </button>
          </form>
        </div>
      </section>


      {/* 10. LUXURY FOOTER */}
      <footer className="bg-[#FAF6F0] pt-16 pb-8 border-t border-[#E8C7B7]/10 relative z-20 text-xs text-[#2C2C2C]/60">
        <div className="container mx-auto max-w-[1300px] px-4 grid grid-cols-2 md:grid-cols-12 gap-8 items-start mb-12">
          
          <div className="col-span-2 md:col-span-4 space-y-4">
            <h3 className="font-serif text-xl tracking-widest text-[#2C2C2C] uppercase font-light">LUMIÈRE</h3>
            <p className="max-w-xs font-light leading-relaxed">
              Curators of high-end computational and architectural replica simulation jewelry configurations for the demanding contemporary silhouette.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <h5 className="font-semibold text-[#2C2C2C] uppercase tracking-wider text-[10px]">The Archive</h5>
            <ul className="space-y-2 font-light">
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">The Story Vault</a></li>
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">Artisanal Methodologies</a></li>
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">Sustainability Seal</a></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-2 space-y-3">
            <h5 className="font-semibold text-[#2C2C2C] uppercase tracking-wider text-[10px]">Client Care</h5>
            <ul className="space-y-2 font-light">
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">Boutique Allocation Tracking</a></li>
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">Sterility Assurances</a></li>
              <li><a href="#" className="hover:text-[#B76E79] transition-colors">Insured Messenger Logs</a></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 space-y-3">
            <h5 className="font-semibold text-[#2C2C2C] uppercase tracking-wider text-[10px]">The Headquarters</h5>
            <p className="font-light leading-relaxed">
              Atelier Distribution Terminal Block Alpha <br />
              Place Vendôme Registry Runway 77, Paris
            </p>
          </div>

        </div>

        <div className="container mx-auto max-w-[1300px] px-4 pt-8 border-t border-[#E8C7B7]/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px]">
          <p>© {new Date().getFullYear()} Lumière Atelier International. All Rights Reserved.</p>
          <div className="flex gap-4 font-light">
            <a href="#" className="hover:text-[#B76E79] transition-colors">Privacy Charter</a>
            <span>•</span>
            <a href="#" className="hover:text-[#B76E79] transition-colors">Atelier Guidelines</a>
          </div>
        </div>
      </footer>


      {/* GLOBAL HIGH PERFORMANCE CINEMATIC INTERACTION KEYFRAMES */}
      <style>{`
        /* Custom scroll-bar reduction rule */
        .luxury-scrollbar::-webkit-scrollbar {
          height: 3px;
        }
        .luxury-scrollbar::-webkit-scrollbar-track {
          background: #F2ECE7;
        }
        .luxury-scrollbar::-webkit-scrollbar-thumb {
          background: #E8C7B7;
          border-radius: 9px;
        }

        /* Ambient floating particles scriptless layout simulation */
        .luxury-dust-float {
          animation: globalDustFloat infinite linear;
        }
        @keyframes globalDustFloat {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          20% { opacity: 0.25; }
          80% { opacity: 0.25; }
          100% { transform: translateY(-100vh) scale(0.6) rotate(360deg); opacity: 0; }
        }

        /* Hero image micro parallax pulse simulation loop */
        .animate-luxury-zoom {
          animation: luxuryImgZoom 20s ease-in-out infinite alternate;
        }
        @keyframes luxuryImgZoom {
          0% { transform: scale(1.02) translateY(0); }
          100% { transform: scale(1.08) translateY(-10px); }
        }

        /* Entry Elements Animations */
        .animate-subtle-slide-down {
          animation: subtleSlideDown 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-delayed {
          opacity: 0;
          animation: entryPanelReveal 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
        }
        @keyframes subtleSlideDown {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes entryPanelReveal {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Intersection Scroll Reveal Structural Target Classes */
        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-fade-left {
          transform: translateX(-30px);
        }
        .reveal-fade-right {
          transform: translateX(30px);
        }
        .reveal-visible {
          opacity: 1 !important;
          transform: translate(0) !important;
        }
      `}</style>

    </div>
  );
}

export default AboutPage;