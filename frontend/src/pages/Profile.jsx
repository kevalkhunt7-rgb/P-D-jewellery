import React, { useState, useEffect } from 'react';
import { 
  User, ShoppingBag, Heart, MapPin, CreditCard, Bell, Settings, LogOut, 
  Sparkles, ChevronRight, Package, Calendar, Award, Star, ArrowUpRight, Edit3
} from 'lucide-react';

function Profile() {
  // 1. Initialize state from the URL hash if present, default to 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'profile';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 2. Synchronize activeTab with URL hash when back/forward navigation or link changes occur
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      } else {
        setActiveTab('profile');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 3. Setter function that changes both state and updates the browser address window hash
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId === 'profile' ? '' : tabId; // keeps url clean for root profile view
    setIsMobileMenuOpen(false);
  };

  // Sample Mock Data for the Luxury Experience
  const userStats = {
    tier: 'Diamond Orchid Elite',
    points: 2450,
    nextTierPoints: 3000,
    memberSince: 'Nov 2024'
  };

  const orders = [
    { id: "LUM-9821", date: "May 12, 2026", total: "$345.00", status: "In Transit", items: 2, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=150" },
    { id: "LUM-9410", date: "March 28, 2026", total: "$180.00", status: "Delivered", items: 1, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=150" }
  ];

  const wishlistItems = [
    { id: 1, name: "Rose Gold Empress Drop Earrings", price: "$210.00", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300" },
    { id: 2, name: "Champagne Solitaire Royal Ring", price: "$145.00", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=300" }
  ];

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: '1' },
    { id: 'wishlist', label: 'The Wishlist', icon: Heart },
    { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Atelier Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FDF8F3] relative overflow-hidden font-sans text-[#2C2C2C] selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C] pt-6 pb-12">
      
      {/* Background Soft Blurred Organic Reflections */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-[#FFF0EB] via-[#E8C7B7]/10 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-[#D4AF37]/5 to-[#FFF0EB] blur-[150px] pointer-events-none" />

      {/* Floating Ambient Gold Dust Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-30 profile-gold-dust"
            style={{
              width: `${Math.random() * 4 + 3}px`,
              height: `${Math.random() * 4 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${14 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-[1400px]">
        
        {/* TOP CINEMATIC PROFILE HEADER BANNER */}
        <div className="w-full h-44 sm:h-56 rounded-[2rem] relative overflow-hidden mb-8 border border-white shadow-[0_15px_40px_rgba(232,199,183,0.15)] bg-[#2C2C2C]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2C2C] via-[#2C2C2C]/50 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200" 
            alt="Lumiere Silk Background" 
            className="w-full h-full object-cover opacity-60 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-12">
            <div className="flex items-center gap-2 mb-1.5 animate-subtle-slide">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#E8C7B7] font-medium">Lumière Private Lounge</span>
            </div>
            <h1 className="font-serif text-white text-2xl sm:text-4xl tracking-wide font-light">
              Welcome Back, <span className="italic text-[#FFF0EB]">Beautiful</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm tracking-wide mt-2 font-light max-w-md">
              Your curations, architectural styling options, and membership privileges await your discovery.
            </p>
          </div>
        </div>

        {/* MAIN COUTURIER DASHBOARD GRID */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* MOBILE MENU TOGGLE BUTTON */}
          <div className="col-span-12 lg:hidden flex justify-end">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-5 py-3 bg-white/80 backdrop-blur-md border border-[#E8C7B7]/40 rounded-full text-xs font-medium uppercase tracking-widest text-[#2C2C2C] shadow-sm transition-all active:scale-95"
            >
              {isMobileMenuOpen ? 'Close Menu' : 'Atelier Lounge Directory'}
            </button>
          </div>

          {/* LEFT DASHBOARD SIDEBAR PANEL */}
          <div className={`col-span-12 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-[0_20px_50px_rgba(44,44,44,0.03)] luxury-panel-glow transition-all duration-500 lg:block ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            
            {/* User Profile Circle Segment */}
            <div className="text-center pb-6 border-b border-[#E8C7B7]/20">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B76E79] via-[#E8C7B7] to-[#D4AF37] animate-spin-slow opacity-80" />
                <div className="absolute inset-[3px] rounded-full bg-[#FDF8F3] flex items-center justify-center overflow-hidden z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=200" 
                    alt="Sophia Martinez Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#E8C7B7] flex items-center justify-center text-[#2C2C2C] hover:text-[#B76E79] shadow-md transition-transform duration-300 hover:scale-110 z-20">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 className="font-serif text-lg font-medium tracking-wide text-[#2C2C2C]">Sophia Martinez</h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#B76E79]/10 to-[#D4AF37]/10 rounded-full border border-[#E8C7B7]/30 mt-1.5">
                <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#2C2C2C]/80">{userStats.tier}</span>
              </div>
            </div>

            {/* Navigation Directory List */}
            <nav className="mt-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-all duration-300 group ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#FFF0EB] to-white text-[#B76E79] font-medium shadow-sm border-l-2 border-[#B76E79]' 
                        : 'text-[#2C2C2C]/70 hover:text-[#2C2C2C] hover:bg-white/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#B76E79]' : 'text-[#2C2C2C]/40 group-hover:text-[#B76E79]/70'}`} />
                      <span className="tracking-wide">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-[#B76E79] text-white rounded-full scale-90">{item.badge}</span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 opacity-0 transition-all transform ${isActive ? 'opacity-100 translate-x-0' : 'group-hover:opacity-40 -translate-x-1'}`} />
                    )}
                  </button>
                );
              })}
              
              <div className="pt-4 mt-4 border-t border-[#E8C7B7]/20">
                <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm text-[#2C2C2C]/50 hover:text-red-700 hover:bg-red-50/30 transition-all group">
                  <LogOut className="w-4 h-4 text-[#2C2C2C]/30 group-hover:text-red-600" />
                  <span className="tracking-wide">Leave Atelier</span>
                </button>
              </div>
            </nav>
          </div>

          {/* RIGHT SIDE MAIN PROFILE AREA */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            
            {/* PROFILE DETAIL VIEW */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in-slow">
                
                {/* Loyalty Tier Progress Status Segment */}
                <div className="bg-gradient-to-br from-white to-[#FFF0EB]/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white shadow-[0_20px_50px_rgba(232,199,183,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Award className="w-28 h-28 text-[#D4AF37]" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-[#E8C7B7]/30 pb-4 md:pb-0 md:pr-6">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#2C2C2C]/50 mb-1">Your Lounge Balance</p>
                      <h3 className="font-serif text-3xl font-semibold text-[#2C2C2C] flex items-baseline gap-1.5">
                        {userStats.points} <span className="text-xs font-sans font-normal text-[#2C2C2C]/60 tracking-normal">Orchid Crystals</span>
                      </h3>
                      <p className="text-xs text-[#B76E79] font-medium mt-1 inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> $24.50 Boutique Credits Ready
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="font-medium text-[#2C2C2C]/70">Next Tier Progression: <span className="text-[#2C2C2C] font-semibold">Orchid Sovereign</span></span>
                        <span className="font-semibold text-[#D4AF37]">550 Crystals needed</span>
                      </div>
                      <div className="w-full h-2 bg-[#F2ECE7] rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#B76E79] via-[#E8C7B7] to-[#D4AF37] rounded-full" style={{ width: `${(userStats.points / userStats.nextTierPoints) * 100}%` }} />
                      </div>
                      <p className="text-[11px] text-[#2C2C2C]/40 mt-2">Earn 10 Orchid Crystals for every $1 spent. Unlock complimentary white-glove shipping on your next tier elevation.</p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Core Management Form */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white shadow-[0_20px_50px_rgba(44,44,44,0.02)]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl font-medium tracking-wide">Account Particulars</h3>
                    <button className="px-4 py-2 text-xs border border-[#E8C7B7] hover:border-[#B76E79] text-[#2C2C2C] hover:text-[#B76E79] rounded-full transition-colors font-medium tracking-wider uppercase">
                      Update Account
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C2C2C]/40">First Name</span>
                      <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl text-sm border border-[#E8C7B7]/20 font-medium">Sophia</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C2C2C]/40">Last Name</span>
                      <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl text-sm border border-[#E8C7B7]/20 font-medium">Martinez</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C2C2C]/40">Email Correspondence</span>
                      <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl text-sm border border-[#E8C7B7]/20 font-medium">sophia.martinez@atelier.com</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#2C2C2C]/40">Primary Telephone</span>
                      <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl text-sm border border-[#E8C7B7]/20 font-medium">+1 (555) 234-5678</p>
                    </div>
                  </div>
                </div>

                {/* Recent Items Carousel Hook */}
                <div>
                  <h4 className="font-serif text-lg font-medium mb-4 tracking-wide">Recently Admired</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { name: "Siren Marquise Choker", price: "$320", img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=150" },
                      { name: "Atelier Blossom Cuff", price: "$195", img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=150" }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/60 border border-white p-3 rounded-2xl text-center group cursor-pointer hover:shadow-md transition-all">
                        <div className="overflow-hidden rounded-xl bg-[#FDF8F3] mb-2.5 aspect-square">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        </div>
                        <p className="text-xs font-serif truncate text-[#2C2C2C] px-1">{item.name}</p>
                        <p className="text-xs text-[#B76E79] font-medium mt-0.5">{item.price}</p>
                      </div>
                    ))}
                    <div className="border border-dashed border-[#E8C7B7]/60 rounded-2xl p-4 flex flex-col items-center justify-center text-center bg-[#FFF0EB]/10 h-full">
                      <p className="text-xs text-[#2C2C2C]/40 font-light max-w-[100px]">Discover personalized recommendations</p>
                      <ArrowUpRight className="w-4 h-4 text-[#B76E79] mt-2" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ORDERS VIEW */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-fade-in-slow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-serif text-2xl font-medium tracking-wide">Boutique Despatch Log</h3>
                  <span className="text-xs text-[#2C2C2C]/50 tracking-wider">Showing 2 Recent Commissions</span>
                </div>

                {orders.map((order, index) => (
                  <div key={index} className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 shadow-[0_12px_40px_rgba(44,44,44,0.02)] transition-all duration-300 hover:shadow-md group">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8C7B7]/20 pb-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#B76E79]">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[#2C2C2C]/40 uppercase tracking-widest">Order Identifier</p>
                          <p className="text-sm font-semibold text-[#2C2C2C]">{order.id}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2C2C]/40 uppercase tracking-widest text-right">Commission Date</p>
                        <p className="text-sm font-medium text-[#2C2C2C]/80 inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#2C2C2C]/30" /> {order.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#2C2C2C]/40 uppercase tracking-widest text-right">Settlement Total</p>
                        <p className="text-sm font-bold text-[#B76E79] text-right">{order.total}</p>
                      </div>
                      <div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide ${
                          order.status === 'In Transit' 
                            ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 animate-pulse' 
                            : 'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <img src={order.image} alt="Jewelry thumbnail" className="w-14 h-14 object-cover rounded-xl border border-[#E8C7B7]/20"/>
                        <div>
                          <p className="text-sm font-serif font-medium text-[#2C2C2C]">Premium Curated Parcel ({order.items} items)</p>
                          <p className="text-xs text-[#2C2C2C]/50 mt-0.5">Dispatched via Premium Atelier White-Glove Messenger</p>
                        </div>
                      </div>
                      <button className="px-5 py-2.5 bg-[#2C2C2C] hover:bg-[#B76E79] text-white font-medium text-xs rounded-full uppercase tracking-widest transition-colors duration-300">
                        Trace Parcel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* WISHLIST VIEW */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6 animate-fade-in-slow">
                <div className="mb-2">
                  <h3 className="font-serif text-2xl font-medium tracking-wide">The Wishlist Vault</h3>
                  <p className="text-xs text-[#2C2C2C]/50 mt-1">Your privately reserved acquisitions. Sharing this locker grants boutique allocation hints to partners.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-white/80 backdrop-blur-xl border border-white rounded-3xl overflow-hidden shadow-sm group hover:shadow-md transition-all duration-300 relative">
                      <div className="aspect-[4/3] bg-[#FDF8F3] relative overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-[4000ms] group-hover:scale-105"/>
                        <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-sm hover:scale-110 active:scale-95 transition-transform">
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <div className="p-5 flex items-center justify-between gap-4">
                        <div>
                          <h4 className="font-serif text-base font-medium text-[#2C2C2C] tracking-wide">{item.name}</h4>
                          <p className="text-sm text-[#B76E79] font-semibold mt-1">{item.price}</p>
                        </div>
                        <button className="p-3 bg-[#FFF0EB] hover:bg-gradient-to-br hover:from-[#B76E79] hover:to-[#D4AF37] rounded-full text-[#B76E79] hover:text-white transition-all duration-300 shadow-sm flex-shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FALLBACK INFO FOR UNFINISHED TABS */}
            {!['profile', 'orders', 'wishlist'].includes(activeTab) && (
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white shadow-sm animate-fade-in-slow">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium capitalize mb-1">{activeTab.replace('-', ' ')}</h3>
                <p className="text-sm text-[#2C2C2C]/50 max-w-sm mx-auto">This section of your private lounge is being curated by your architectural design team.</p>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Embedded High Performance CSS Transitions & Keyframes */}
      <style>{`
        .profile-gold-dust {
          animation: profileDustFloat infinite linear;
        }
        @keyframes profileDustFloat {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          15% { opacity: 0.3; }
          85% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.7) rotate(360deg); opacity: 0; }
        }

        .animate-spin-slow {
          animation: slowRingSpin 10s linear infinite;
        }
        @keyframes slowRingSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .luxury-panel-glow {
          box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.7);
        }

        .animate-fade-in-slow {
          animation: entryPanelReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-subtle-slide {
          animation: subtleSlideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes entryPanelReveal {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes subtleSlideIn {
          0% { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}

export default Profile;