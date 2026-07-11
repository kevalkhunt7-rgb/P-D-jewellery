import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Check, ArrowRight, Eye, EyeOff, KeyRound, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { sanitizePhone, isValidPhone, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';

function Login() {
  const { login, register, loginWithGoogle, sendOTP, verifyOTP, sendForgotOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // OTP Verification States
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Form States
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // ── Forgot Password States ───────────────────────────────────────────────
  const [isForgotMode, setIsForgotMode] = useState(false);
  // step: 'email' | 'otp' | 'newpass'
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotResendTimer, setForgotResendTimer] = useState(0);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Handle OTP Resend countdown timer (registration)
  React.useEffect(() => {
    let timer;
    if (isVerifyingOtp && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifyingOtp, resendTimer]);

  // Handle OTP Resend countdown timer (forgot password)
  React.useEffect(() => {
    let timer;
    if (forgotResendTimer > 0) {
      timer = setInterval(() => {
        setForgotResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [forgotResendTimer]);

  const resetForgotFlow = () => {
    setIsForgotMode(false);
    setForgotStep('email');
    setForgotEmail('');
    setForgotOtp('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setShowForgotPass(false);
    setForgotResendTimer(0);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isSendingOtp) return;
    setIsSendingOtp(true);
    const result = await sendOTP(registerData.email);
    setIsSendingOtp(false);
    if (result?.success) {
      setResendTimer(60);
    }
  };

  // ── Forgot password step handlers ─────────────────────────────────────────
  const handleForgotSendOtp = async () => {
    if (!forgotEmail.trim()) return toast.error('Please enter your email address');
    setIsForgotLoading(true);
    const result = await sendForgotOTP(forgotEmail.trim());
    setIsForgotLoading(false);
    if (result?.success) {
      setForgotStep('otp');
      setForgotResendTimer(60);
    }
  };

  const handleForgotResendOtp = async () => {
    if (forgotResendTimer > 0 || isForgotLoading) return;
    setIsForgotLoading(true);
    const result = await sendForgotOTP(forgotEmail.trim());
    setIsForgotLoading(false);
    if (result?.success) setForgotResendTimer(60);
  };

  const handleForgotVerifyOtp = async () => {
    if (forgotOtp.length !== 6) return toast.error('Please enter the 6-digit OTP');
    setIsForgotLoading(true);
    // Call the backend — does real bcrypt comparison of the stored hash
    const result = await verifyOTP(forgotEmail.trim(), forgotOtp);
    setIsForgotLoading(false);
    if (result?.success) {
      // OTP confirmed by server — safe to proceed to new-password step
      setForgotStep('newpass');
    }
    // If OTP is wrong, backend returns error toast with remaining attempts — stay on this step
  };

  const handleForgotResetPassword = async () => {
    if (forgotNewPass.length < 6) return toast.error('Password must be at least 6 characters');
    if (forgotNewPass !== forgotConfirmPass) return toast.error('Passwords do not match');
    setIsForgotLoading(true);
    const result = await resetPassword(forgotEmail.trim(), forgotOtp, forgotNewPass);
    setIsForgotLoading(false);
    if (result?.success) {
      resetForgotFlow();
      setIsLogin(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        navigate('/');
      }
    } else {
      if (!agreeTerms) {
        return toast.error('You must agree to the Terms & Privacy Guidelines');
      }
      if (registerData.password !== registerData.confirmPassword) {
        return toast.error('Passwords do not match');
      }
      if (!isValidPhone(registerData.phone)) {
        return toast.error(PHONE_ERROR_MESSAGE);
      }

      if (!isVerifyingOtp) {
        // Step 1: Send OTP code
        setIsSendingOtp(true);
        const result = await sendOTP(registerData.email);
        setIsSendingOtp(false);
        if (result?.success) {
          setIsVerifyingOtp(true);
          setResendTimer(60);
        }
      } else {
        // Step 2: Verify OTP and Register
        if (otpCode.length !== 6) {
          return toast.error('Please enter a valid 6-digit OTP code');
        }
        setIsVerifying(true);
        const verifyResult = await verifyOTP(registerData.email, otpCode);
        if (verifyResult?.success) {
          const registerSuccess = await register({
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            password: registerData.password,
          });
          setIsVerifying(false);
          if (registerSuccess) {
            navigate('/');
          }
        } else {
          setIsVerifying(false);
        }
      }
    }
  };

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  return (
    /* FIXED: Added strict 'overflow-x-hidden' and 'max-w-full' to prevent any elements or particles from stretching the page layout horizontally */
    <div className="min-h-screen w-full max-w-full bg-[#FDF8F3] relative overflow-x-hidden flex items-center justify-center font-sans selection:bg-[#E8C7B7]/30 selection:text-[#2C2C2C]">

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
      {/* FIXED: Modified grid rules and max widths to fit small screens seamlessly */}
      <div className="w-full min-h-screen md:min-h-[85vh] max-w-[1300px] bg-white/40 md:backdrop-blur-xl md:rounded-[32px] md:shadow-[0_32px_80px_rgba(44,44,44,0.06)] md:border md:border-white/60 overflow-hidden grid grid-cols-12 relative z-10 transition-all duration-700 m-0 md:m-6">

        {/* LEFT SIDE: Cinematic Editorial Image & Branding */}
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden group bg-[#2C2C2C]">
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/90 via-[#2C2C2C]/30 to-black/20 z-10 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.15),transparent_50%)] z-10 mix-blend-screen pointer-events-none" />

          <img
            src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=800"
            alt="P&D Luxury Jewellery Model"
            className="w-full h-full object-cover transition-transform duration-[8000ms] cubic-bezier(0.16, 1, 0.3, 1) scale-105 group-hover:scale-110"
          />

          <div className="absolute inset-x-0 bottom-0 p-12 z-20 flex flex-col justify-end h-full">
            <h1 className="font-serif text-white tracking-[0.25em] text-3xl font-bold mb-2 animate-fade-in">
              P&D <br /> Luxury Jewellery
            </h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-[#E8C7B7] to-[#D4AF37] mb-6" />

            <p className="font-serif italic text-white/90 text-2xl font-bold leading-relaxed tracking-wide">
              “Elegance Begins Here”
            </p>
            <p className="text-white/60 text-xs tracking-[0.1em] mt-3 uppercase">
              The Bridal & Heritage Boutique Collection
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Elegant Interactive Glassmorphism Form Area */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center px-4 sm:px-12 lg:px-20 py-12 relative w-full max-w-full">

          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="font-serif tracking-[0.2em] text-2xl font-semibold text-[#2C2C2C]">
              P&D LUXURY JEWELLERY
            </h1>
            <p className="text-[#B76E79] text-xs tracking-[0.15em] uppercase mt-1">High-End Luxury</p>
          </div>

          {/* Form Luxury Card */}
          {/* FIXED: Changed standard padding slightly on mobile ('p-5 sm:p-10') so it doesn't push bounds out */}
          <div className="w-full max-w-[460px] bg-white/70 backdrop-blur-md rounded-3xl p-5 sm:p-10 border border-white/80 shadow-[0_20px_50px_rgba(232,199,183,0.15)] relative box-border">
            <div className="absolute inset-0 rounded-3xl border border-transparent pointer-events-none luxury-card-glow" />

            {/* View Switcher Tabs (Login vs Register) — hidden during forgot flow */}
            {!isForgotMode && (
            <div className="flex justify-center gap-8 mb-8 border-b border-[#E8C7B7]/20 pb-4 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setIsVerifyingOtp(false);
                  setOtpCode('');
                  resetForgotFlow();
                }}
                className={`font-serif text-lg tracking-wider relative pb-2 transition-all duration-300 ${isLogin ? 'text-[#2C2C2C] font-medium' : 'text-[#2C2C2C]/40 hover:text-[#2C2C2C]/70'
                  }`}
              >
                Sign In
                {isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#B76E79] to-[#D4AF37] rounded-full animate-tab-slide" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setIsVerifyingOtp(false);
                  setOtpCode('');
                  resetForgotFlow();
                }}
                className={`font-serif text-lg tracking-wider relative pb-2 transition-all duration-300 ${!isLogin ? 'text-[#2C2C2C] font-medium' : 'text-[#2C2C2C]/40 hover:text-[#2C2C2C]/70'
                  }`}
              >
                Register
                {!isLogin && (
                  <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#B76E79] to-[#D4AF37] rounded-full animate-tab-slide" />
                )}
              </button>
            </div>
            )}

            {/* Core Dynamic Content Form Wrapper — hidden during forgot flow */}
            {!isForgotMode && (
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10 animate-fade-in-quick">

              {isLogin && (
                <>
                  {/* EMAIL ADDRESS */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type="email"
                        required
                        placeholder="sophia@example.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Password</label>
                      <button
                        type="button"
                        onClick={() => { setIsForgotMode(true); setForgotStep('email'); }}
                        className="text-xs text-[#B76E79] hover:text-[#D4AF37] tracking-wide transition-colors font-medium"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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

                  {/* REMEMBER ME */}
                  <div className="pt-1 flex items-start justify-between">
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
                  </div>
                </>
              )}

              {!isLogin && !isVerifyingOtp && (
                <>
                  {/* FULL NAME */}
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

                  {/* EMAIL ADDRESS */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type="email"
                        required
                        placeholder="sophia@example.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                      />
                    </div>
                  </div>

                  {/* PHONE NUMBER */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: sanitizePhone(e.target.value) })}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                      />
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
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

                  {/* CONFIRM PASSWORD */}
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

                  {/* TERMS & CONDITIONS */}
                  <div className="pt-1 flex items-start justify-between">
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
                      <span className="text-xs text-[#2C2C2C]/70 group-hover:text-[#2C2C2C] transition-colors leading-normal font-sans">
                        I agree to the <a href="#terms" className="underline text-[#B76E79]">Terms</a> & <a href="#privacy" className="underline text-[#B76E79]">Luxury Privacy Guidelines</a>
                      </span>
                    </label>
                  </div>
                </>
              )}

              {!isLogin && isVerifyingOtp && (
                <div className="space-y-4 py-2 animate-fade-in-quick font-sans">
                  <div className="text-center bg-[#FAF4EE] p-4 rounded-2xl border border-[#E8C7B7]/30">
                    <p className="text-xs text-[#2C2C2C]/60 tracking-wide">
                      We have sent an exclusive security code to
                    </p>
                    <p className="font-semibold text-sm text-[#B76E79] mt-1 break-all">{registerData.email}</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70 text-center">6-Digit Verification Code</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-4 py-3.5 tracking-[0.5em] text-center font-mono bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-lg transition-all duration-300 input-luxury-focus"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setIsVerifyingOtp(false);
                        setOtpCode('');
                      }}
                      className="text-[#B76E79] hover:underline"
                    >
                      Change Details
                    </button>

                    <div className="font-medium">
                      {resendTimer > 0 ? (
                        <span className="text-[#2C2C2C]/40">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isSendingOtp}
                          className="text-[#D4AF37] hover:underline"
                        >
                          {isSendingOtp ? 'Sending...' : 'Resend Code'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION SUBMIT BUTTON WITH PREMIUM SHIMMER EFFECT */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSendingOtp || isVerifying}
                  className="luxury-action-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg border-0 relative overflow-hidden flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)',
                    backgroundSize: '200% auto'
                  }}
                >
                  <span>
                    {isLogin 
                      ? 'Login' 
                      : isVerifyingOtp 
                        ? (isVerifying ? 'Verifying...' : 'Verify & Register')
                        : (isSendingOtp ? 'Sending OTP...' : 'Create Exclusive Profile')
                    }
                  </span>
                  <ArrowRight className="w-4 h-4" />
                  <div className="btn-shimmer-sweep" />
                </button>
              </div>

              {/* ALTERNATIVE SOCIAL SIGN IN */}
              <div className="pt-6 text-center">
                <div className="relative flex py-2 items-center justify-center mb-4">
                  <div className="flex-grow border-t border-[#E8C7B7]/20" />
                  <span className="flex-shrink mx-4 text-[10px] font-medium tracking-widest text-[#2C2C2C]/40 uppercase">Or Continue With</span>
                  <div className="flex-grow border-t border-[#E8C7B7]/20" />
                </div>

                {/* FIXED: Removed raw width="380px" parameter from GoogleLogin block which forced text overflow off-screen on mobile viewports. Added a standard responsive max-width layout structure to its container instead */}
                <div className="flex justify-center w-full min-h-[44px] max-w-full overflow-hidden">
                  {clientId ? (
                    <GoogleOAuthProvider clientId={clientId}>
                      <GoogleLogin
                        theme="outline"
                        size="large"
                        shape="pill"
                        text="signin_with"
                        onSuccess={async (credentialResponse) => {
                          const success = await loginWithGoogle(credentialResponse.credential);
                          if (success) {
                            navigate('/');
                          }
                        }}
                        onError={() => {
                          console.error("Google Auth Architecture Failure Handshake");
                          toast.error("Google login failed. Please try again.");
                        }}
                      />
                    </GoogleOAuthProvider>
                  ) : (
                    <p className="text-xs text-red-400 font-mono tracking-wider font-sans">Missing VITE_GOOGLE_CLIENT_ID configuration</p>
                  )}
                </div>
              </div>

            </form>
            )} {/* end !isForgotMode */}

            {/* ── FORGOT PASSWORD PANEL ──────────────────────────────────── */}
            {isForgotMode && (
              <div className="space-y-5 relative z-10 animate-fade-in-quick">

                {/* Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-[#E8C7B7]/20">
                  <button
                    type="button"
                    onClick={resetForgotFlow}
                    className="p-1.5 rounded-full hover:bg-[#E8C7B7]/20 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#B76E79]" />
                  </button>
                  <div>
                    <h2 className="font-serif text-lg tracking-wide text-[#2C2C2C]">Reset Password</h2>
                    <p className="text-[10px] text-[#2C2C2C]/40 tracking-widest uppercase">
                      {forgotStep === 'email' ? 'Step 1 of 3 — Enter Email' : forgotStep === 'otp' ? 'Step 2 of 3 — Verify OTP' : 'Step 3 of 3 — New Password'}
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center gap-2 justify-center">
                  {['email','otp','newpass'].map((s) => (
                    <div key={s} className={`rounded-full transition-all duration-300 ${forgotStep === s ? 'w-6 h-2 bg-gradient-to-r from-[#B76E79] to-[#D4AF37]' : 'w-2 h-2 bg-[#E8C7B7]'}`} />
                  ))}
                </div>

                {/* STEP 1 — Email */}
                {forgotStep === 'email' && (
                  <div className="space-y-4">
                    <div className="text-center bg-[#FAF4EE] p-4 rounded-2xl border border-[#E8C7B7]/30">
                      <KeyRound className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-xs text-[#2C2C2C]/60 leading-relaxed">
                        Enter the email address linked to your account.<br/>We'll send you a 6-digit OTP.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                        <input
                          type="email"
                          placeholder="sophia@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleForgotSendOtp()}
                          className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={handleForgotSendOtp}
                      className="luxury-action-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg border-0 relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)', backgroundSize: '200% auto' }}
                    >
                      <span>{isForgotLoading ? 'Sending OTP...' : 'Send Reset OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                      <div className="btn-shimmer-sweep" />
                    </button>
                  </div>
                )}

                {/* STEP 2 — OTP */}
                {forgotStep === 'otp' && (
                  <div className="space-y-4">
                    <div className="text-center bg-[#FAF4EE] p-4 rounded-2xl border border-[#E8C7B7]/30">
                      <p className="text-xs text-[#2C2C2C]/60 tracking-wide">OTP sent to</p>
                      <p className="font-semibold text-sm text-[#B76E79] mt-1 break-all">{forgotEmail}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70 text-center">6-Digit OTP Code</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="••••••"
                          value={forgotOtp}
                          onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                          onKeyDown={(e) => e.key === 'Enter' && handleForgotVerifyOtp()}
                          className="w-full pl-11 pr-4 py-3.5 tracking-[0.5em] text-center font-mono bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-lg transition-all duration-300 input-luxury-focus"
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-2 text-xs">
                      <button type="button" onClick={() => { setForgotStep('email'); setForgotOtp(''); }} className="text-[#B76E79] hover:underline">
                        Change Email
                      </button>
                      <div className="font-medium">
                        {forgotResendTimer > 0 ? (
                          <span className="text-[#2C2C2C]/40">Resend in {forgotResendTimer}s</span>
                        ) : (
                          <button type="button" onClick={handleForgotResendOtp} disabled={isForgotLoading} className="text-[#D4AF37] hover:underline">
                            {isForgotLoading ? 'Sending...' : 'Resend OTP'}
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={handleForgotVerifyOtp}
                      className="luxury-action-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg border-0 relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)', backgroundSize: '200% auto' }}
                    >
                      <span>{isForgotLoading ? 'Verifying...' : 'Verify OTP'}</span>
                      <ArrowRight className="w-4 h-4" />
                      <div className="btn-shimmer-sweep" />
                    </button>
                  </div>
                )}

                {/* STEP 3 — New Password */}
                {forgotStep === 'newpass' && (
                  <div className="space-y-4">
                    <div className="text-center bg-[#FAF4EE] p-4 rounded-2xl border border-[#E8C7B7]/30">
                      <ShieldCheck className="w-8 h-8 text-[#D4AF37] mx-auto mb-2" />
                      <p className="text-xs text-[#2C2C2C]/60 leading-relaxed">OTP verified. Set your new password.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                        <input
                          type={showForgotPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={forgotNewPass}
                          onChange={(e) => setForgotNewPass(e.target.value)}
                          className="w-full pl-11 pr-12 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                        />
                        <button type="button" onClick={() => setShowForgotPass(!showForgotPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2C2C2C]/40 hover:text-[#B76E79] transition-colors p-1">
                          {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium uppercase tracking-wider text-[#2C2C2C]/70">Confirm New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B76E79]/60" />
                        <input
                          type={showForgotPass ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={forgotConfirmPass}
                          onChange={(e) => setForgotConfirmPass(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-white/60 border border-[#E8C7B7]/40 rounded-full focus:outline-none focus:border-[#B76E79] text-[#2C2C2C] placeholder-[#2C2C2C]/30 text-sm transition-all duration-300 input-luxury-focus"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isForgotLoading}
                      onClick={handleForgotResetPassword}
                      className="luxury-action-btn w-full py-4 px-6 rounded-full text-white font-medium tracking-widest text-xs uppercase shadow-lg border-0 relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #B76E79 0%, #E8C7B7 50%, #D4AF37 100%)', backgroundSize: '200% auto' }}
                    >
                      <span>{isForgotLoading ? 'Resetting...' : 'Reset Password'}</span>
                      <ArrowRight className="w-4 h-4" />
                      <div className="btn-shimmer-sweep" />
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* Dynamic Fine-Print Bottom Interactive Disclaimer */}
          <div className="mt-8 text-center max-w-[340px]">
            <p className="text-[11px] text-[#2C2C2C]/50 tracking-wide leading-relaxed">
              Every digital interaction with P&D Luxury Jewellery is encrypted using strict secure commerce mechanisms. For boutique concierge help, please email <a href="mailto:support@pdluxuryjewellery.com" className="text-[#B76E79] underline">Boutique Support</a>.
            </p>
          </div>

        </div>
      </div>

      {/* High-Performance Micro-Interaction Custom CSS Architecture */}
      <style>{`
        .gold-particle {
          animation: particleFloat infinite linear;
        }
        @keyframes particleFloat {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) rotate(360deg) scale(0.6); opacity: 0; }
        }

        .animate-tab-slide {
          animation: lineExpand 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes lineExpand {
          0% { transform: scaleX(0); opacity: 0; }
          100% { transform: scaleX(1); opacity: 1; }
        }

        .input-luxury-focus:focus {
          box-shadow: 0 0 0 4px rgba(232, 199, 183, 0.25), 0 4px 12px rgba(183, 110, 121, 0.05);
          background-color: #ffffff !important;
        }

        .luxury-card-glow {
          box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(232, 199, 183, 0.3);
        }

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

export default Login;