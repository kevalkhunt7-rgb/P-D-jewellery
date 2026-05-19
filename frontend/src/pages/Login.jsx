import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Check, ArrowRight, Eye, EyeOff } from 'lucide-react';

 function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  const handleSocialAuth = (platform) => {
    console.log(`Connecting via ${platform}...`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting Form Data:', isLogin ? loginData : registerData);
  };

  return (
    <div className="min-h-screen w-full bg-[#FDF8F3] relative overflow-hidden flex items-center justify-center font-sans selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C]">
      
      {/* Background Soft Blurred Organic Shapes & Reflections */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-gradient-to-tr from-[#FFF0EB] to-transparent blur-[120px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] rounded-full bg-gradient-to-bl from-[#E8C7B7]/20 to-[#D4AF37]/10 blur-[140px] opacity-60 pointer-events-none" />

      {/* Floating Ambient Luxury Gold Particles */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-40 gold-particle"
            style={{
              width: `${Math.random() * 5 + 3}px`,
              height: `${Math.random() * 5 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 12}s`
            }}
          />
        ))}
      </div>

      {/* Main Container: Editorial Split-Screen Layout */}
      <div className="w-full min-h-screen md:min-h-[85vh] max-w-[1300px] bg-white/40 md:backdrop-blur-xl md:rounded-[32px] md:shadow-[0_32px_80px_rgba(44,44,44,0.06)] md:border md:border-white/60 overflow-hidden grid lg:grid-cols-12 relative z-10 transition-all duration-700 m-0 md:m-6">
        
        {/* LEFT SIDE: Cinematic Editorial Image & Branding */}
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden group bg-[#2C2C2C]">
          {/* Satin Texture/Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/90 via-[#2C2C2C]/30 to-black/20 z-10 transition-opacity duration-700" />
          
          {/* Subtle Jewelry Light Reflection Layer */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.15),transparent_50%)] z-10 mix-blend-screen pointer-events-none" />

          {/* Luxury High-Fashion Editorial Model Image */}
          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800"
            alt="Lumière Fine Jewelry Model"
            className="w-full h-full object-cover transition-transform duration-[8000ms] cubic-bezier(0.16, 1, 0.3, 1) scale-105 group-hover:scale-110"
          />

          {/* Brand Overlay Text Content */}
          <div className="absolute inset-x-0 bottom-0 p-12 z-20 flex flex-col justify-end h-full">
            <h1 className="font-serif text-white tracking-[0.25em] text-3xl font-light mb-2 animate-fade-in">
              LUMIÈRE
            </h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-[#E8C7B7] to-[#D4AF37] mb-6" />
            
            <p className="font-serif italic text-white/90 text-2xl font-light leading-relaxed tracking-wide">
              “Elegance Begins Here”
            </p>
            <p className="text-white/60 text-xs tracking-[0.1em] mt-3 uppercase">
              The Bridal & Heritage Boutique Collection
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Elegant Interactive Glassmorphism Form Area */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center px-6 sm:px-12 lg:px-20 py-12 relative">
          
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-serif tracking-[0.3em] text-3xl font-semibold text-[#2C2C2C]">
              LUMIÈRE
            </h1>
            <p className="text-[#B76E79] text-xs tracking-[0.15em] uppercase mt-1">High-End Atelier</p>
          </div>

          {/* Form Luxury Card */}
          <div className="w-full max-w-[460px] bg-white/70 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-white/80 shadow-[0_20px_50px_rgba(232,199,183,0.15)] relative">
            
            {/* Form Inner Border Glow Effect */}
            <div className="absolute inset-0 rounded-3xl border border-transparent pointer-events-none luxury-card-glow" />

            {/* View Switcher Tabs (Login vs Register) */}
            <div className="flex justify-center gap-8 mb-8 border-b border-[#E8C7B7]/20 pb-4 relative z-10">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`font-serif text-lg tracking-wider relative pb-2 transition-all duration-300 ${
                  isLogin ? 'text-[#2C2C2C] font-medium' : 'text-[#2C2C2C]/40 hover:text-[#2C2C2C]/70'
                }`}
              >
                Sign In
                {isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#B76E79] to-[#D4AF37] rounded-full animate-tab-slide" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`font-serif text-lg tracking-wider relative pb-2 transition-all duration-300 ${
                  !isLogin ? 'text-[#2C2C2C] font-medium' : 'text-[#2C2C2C]/40 hover:text-[#2C2C2C]/70'
                }`}
              >
                Register
                {!isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#B76E79] to-[#D4AF37] rounded-full animate-tab-slide" />
                )}
              </button>
            </div>

            {/* Core Dynamic Content Form Wrapper */}
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10 animate-fade-in-quick">
              
              {!isLogin && (
                /* FULL NAME (Register Only) */
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                    <input
                      type="text"
                      required
                      placeholder="Sophia Martinez"
                      value={registerData.name}
                      onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                    />
                  </div>
                </div>
              )}

              {/* EMAIL ADDRESS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                  <input
                    type="email"
                    required
                    placeholder="sophia@example.com"
                    value={isLogin ? loginData.email : registerData.email}
                    onChange={(e) =>
                      isLogin
                        ? setLoginData({ ...loginData, email: e.target.value })
                        : setRegisterData({ ...registerData, email: e.target.value })
                    }
                    className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                  />
                </div>
              </div>

              {!isLogin && (
                /* PHONE NUMBER (Register Only) */
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                    <input
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                    />
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Password</label>
                  {isLogin && (
                    <a href="#forgot" className="text-xs text-[#B76E79] hover:text-[#D4AF37] tracking-wide transition-colors">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={isLogin ? loginData.password : registerData.password}
                    onChange={(e) =>
                      isLogin
                        ? setLoginData({ ...loginData, password: e.target.value })
                        : setRegisterData({ ...registerData, password: e.target.value })
                    }
                    className="w-full pl-11 pr-12 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#B76E79] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                /* CONFIRM PASSWORD (Register Only) */
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                    />
                  </div>
                </div>
              )}

              {/* SYSTEM CONDITIONS SWITCH / CHECKBOXES */}
              <div className="pt-1 flex items-start justify-between">
                {isLogin ? (
                  <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-[#B76E79] border-[#B76E79]' : 'border-[#E8C7B7] bg-white'}`}>
                        {rememberMe && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                    </div>
                    <span className="text-xs text-[#2C2C2C]/70 group-hover:text-[#2C2C2C] transition-colors">Remember my preference</span>
                  </label>
                ) : (
                  <label className="flex items-start gap-2.5 cursor-pointer select-none group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={() => setAgreeTerms(!agreeTerms)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-300 ${agreeTerms ? 'bg-[#B76E79] border-[#B76E79]' : 'border-[#E8C7B7] bg-white'}`}>
                        {agreeTerms && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                      </div>
                    </div>
                    <span className="text-xs text-[#2C2C2C]/70 group-hover:text-[#2C2C2C] transition-colors leading-normal">
                      I agree to the <a href="#terms" className="underline text-[#B76E79]">Terms</a> & <a href="#privacy" className="underline text-[#B76E79]">Atelier Privacy Guidelines</a>
                    </span>
                  </label>
                )}
              </div>

              {/* ACTION SUBMIT BUTTON WITH PREMIUM SHIMMER EFFECT */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="luxury-action-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg border-0 relative overflow-hidden flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)',
                    backgroundSize: '200% auto'
                  }}
                >
                  <span>{isLogin ? 'Enter Atelier' : 'Create Exclusive Profile'}</span>
                  <ArrowRight className="w-4 h-4" />
                  <div className="btn-shimmer-sweep" />
                </button>
              </div>

              {/* ALTERNATIVE SOCIAL SIGN IN */}
              <div className="pt-6 text-center">
                <div className="relative flex py-2 items-center justify-center mb-6">
                  <div className="flex-grow border-t border-[#E8C7B7]/20" />
                  <span className="flex-shrink mx-4 text-[10px] font-medium tracking-widest text-[#2C2C2C]/40 uppercase">Or Continue With</span>
                  <div className="flex-grow border-t border-[#E8C7B7]/20" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('Google')}
                    className="social-luxury-btn flex items-center justify-center gap-2.5 py-3 px-4 bg-white/80 border border-[#E8C7B7]/30 rounded-full hover:bg-[#FFF0EB]/30 text-xs tracking-wider text-[#2C2C2C] transition-all duration-300"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.2-3.2C17.52 1.58 14.96 1 12 1 7.35 1 3.4 3.65 1.44 7.5l3.77 2.92c.9-2.7 3.42-4.38 6.79-4.38z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.48-1.12 2.74-2.38 3.58l3.7 2.87c2.16-1.99 3.41-4.92 3.41-8.6z"/>
                      <path fill="#FBBC05" d="M5.21 14.78c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28L1.44 7.3C.52 9.14 0 11.21 0 13.4s.52 4.26 1.44 6.1l3.77-2.72z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3.37 0-5.89-1.68-6.79-4.38L1.44 16.66C3.4 20.5 7.35 23 12 23z"/>
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialAuth('Apple')}
                    className="social-luxury-btn flex items-center justify-center gap-2.5 py-3 px-4 bg-white/80 border border-[#E8C7B7]/30 rounded-full hover:bg-[#FFF0EB]/30 text-xs tracking-wider text-[#2C2C2C] transition-all duration-300"
                  >
                    <svg className="w-4 h-4 fill-[#2C2C2C]" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                    </svg>
                    <span>Apple</span>
                  </button>
                </div>
              </div>

            </form>
          </div>

          {/* Dynamic Fine-Print Bottom Interactive Disclaimer */}
          <div className="mt-8 text-center max-w-[340px]">
            <p className="text-[11px] text-[#2C2C2C]/50 tracking-wide leading-relaxed">
              Every digital interaction with LUMIÈRE is encrypted using strict secure commerce mechanisms. For boutique concierge help, please email <a href="mailto:concierge@lumiere.com" className="text-[#B76E79] underline">Atelier Support</a>.
            </p>
          </div>

        </div>
      </div>

      {/* High-Performance Micro-Interaction Custom CSS Architecture */}
      <style>{`
        /* Floating particles scriptless simulation */
        .gold-particle {
          animation: particleFloat infinite linear;
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) rotate(360deg) scale(0.6); opacity: 0; }
        }

        /* Luxury Active Tab Indicator Animation */
        .animate-tab-slide {
          animation: lineExpand 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lineExpand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        /* Input Interaction Custom Shadows */
        .input-luxury-focus:focus {
          box-shadow: 0 0 0 4px rgba(232, 199, 183, 0.25), 0 4px 12px rgba(183, 110, 121, 0.05);
          background-color: #ffffff !important;
        }

        /* Glassmorphism Outer Border Glow */
        .luxury-card-glow {
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(232, 199, 183, 0.3);
        }

        /* Button Action Shimmer & Transitions */
        .luxury-action-btn {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .luxury-action-btn:hover {
          background-position: right center !important;
          transform: translateY(-2px);
          box-shadow: 0 15px 35px -5px rgba(183, 110, 121, 0.35), 0 10px 20px -5px rgba(212, 175, 55, 0.2);
        }
        .luxury-action-btn:active {
          transform: translateY(1px);
        }
        .btn-shimmer-sweep {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: translateX(-100%);
        }
        .luxury-action-btn:hover .btn-shimmer-sweep {
          animation: sweepAction 1.2s ease-in-out infinite;
        }
        @keyframes sweepAction {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Social Button Micro Scaling */
        .social-luxury-btn {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, box-shadow 0.25s ease;
        }
        .social-luxury-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(44, 44, 44, 0.03);
          background-color: rgba(255, 240, 235, 0.4);
          border-color: rgba(183, 110, 121, 0.3);
        }

        /* Page Component Initialization Smooth Enters */
        .animate-fade-in {
          animation: entryFade 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-quick {
          animation: entryFadeQuick 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes entryFade {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes entryFadeQuick {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
export default Login