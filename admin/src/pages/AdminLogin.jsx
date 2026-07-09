import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiEye, FiEyeOff, FiUser, FiCheck, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

// phase machine for the submit "seal": idle -> sealing -> granted | denied -> idle
const PHASE = { IDLE: "idle", SEALING: "sealing", GRANTED: "granted", DENIED: "denied" };

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [mounted, setMounted] = useState(false);
  const errorTimeout = useRef(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => () => clearTimeout(errorTimeout.current), []);

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setPhase(PHASE.IDLE);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phase === PHASE.SEALING) return;
    setPhase(PHASE.SEALING);

    if (isLogin) {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setPhase(PHASE.GRANTED);
        toast.success("Successfully logged in as Admin!");
        setTimeout(() => navigate("/"), 620);
      } else {
        const isConnectionError =
          result.message.toLowerCase().includes("network error") ||
          result.message.toLowerCase().includes("failed to fetch");
        toast.error(
          isConnectionError
            ? "Could not connect to the server. Please ensure the backend is running."
            : result.message
        );
        setPhase(PHASE.DENIED);
        errorTimeout.current = setTimeout(() => setPhase(PHASE.IDLE), 720);
      }
    } else {
      try {
        const { data } = await api.post("/admin/admin-requests", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });

        if (data.success) {
          setPhase(PHASE.GRANTED);
          toast.success("Admin request submitted! Waiting for approval.");
          setTimeout(() => {
            switchMode(true);
          }, 620);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to submit request");
        setPhase(PHASE.DENIED);
        errorTimeout.current = setTimeout(() => setPhase(PHASE.IDLE), 720);
      }
    }
  };

  const isBusy = phase === PHASE.SEALING || phase === PHASE.GRANTED;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-neutral-300 antialiased relative overflow-hidden selection:bg-[#cba874]/30 selection:text-[#f1e4c4]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,400;1,9..144,600&family=Manrope:wght@400;500;600;700;800&display=swap');

        .pd-font-display { font-family: 'Fraunces', serif; font-feature-settings: 'liga' 1; }
        .pd-font-body { font-family: 'Manrope', sans-serif; }

        .pd-rise { opacity: 0; transform: translateY(16px); }
        .pd-rise.pd-in { opacity: 1; transform: translateY(0); transition: opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .pd-rise.pd-d1 { transition-delay: 0.05s; }
        .pd-rise.pd-d2 { transition-delay: 0.15s; }
        .pd-rise.pd-d3 { transition-delay: 0.25s; }

        @keyframes pd-facet-turn {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .pd-seal-sheen {
          animation: pd-facet-turn 9s linear infinite;
        }

        @keyframes pd-hairline-drift {
          0% { background-position: 0 0; }
          100% { background-position: 120px 120px; }
        }
        .pd-facet-field {
          background-image:
            repeating-linear-gradient(115deg, rgba(203,168,116,0.05) 0px, rgba(203,168,116,0.05) 1px, transparent 1px, transparent 64px),
            repeating-linear-gradient(25deg, rgba(203,168,116,0.035) 0px, rgba(203,168,116,0.035) 1px, transparent 1px, transparent 64px);
          animation: pd-hairline-drift 26s linear infinite;
        }

        @keyframes pd-sheen-sweep {
          0% { transform: translateX(-130%) skewX(-12deg); opacity: 0; }
          10% { opacity: 0.55; }
          100% { transform: translateX(230%) skewX(-12deg); opacity: 0; }
        }
        .pd-card-sheen::before {
          content: '';
          position: absolute;
          inset: -2px;
          overflow: hidden;
          pointer-events: none;
        }

        @keyframes pd-gem-spin {
          0% { transform: rotate(0deg) scale(1); }
          45% { transform: rotate(190deg) scale(1.12); }
          100% { transform: rotate(360deg) scale(1); }
        }
        .pd-gem-spin { animation: pd-gem-spin 0.85s cubic-bezier(0.65,0,0.35,1) infinite; }

        @keyframes pd-check-pop {
          0% { transform: scale(0.3); opacity: 0; }
          55% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .pd-check-pop { animation: pd-check-pop 0.42s cubic-bezier(0.2,1.4,0.4,1) forwards; }

        @keyframes pd-shake-err {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(3px); }
        }
        .pd-shake { animation: pd-shake-err 0.5s ease-in-out; }

        @media (prefers-reduced-motion: reduce) {
          .pd-seal-sheen, .pd-facet-field, .pd-gem-spin, .pd-check-pop, .pd-shake {
            animation: none !important;
          }
          .pd-rise { opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      {/* Faceted ambient field — quiet gold hairlines, like light on a cut gem case */}
      <div className="absolute inset-0 pd-facet-field pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[420px] bg-[#1e3a5f]/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-9 relative z-10">
        {/* Seal + brand mark */}
        <div className={`flex flex-col items-center text-center pd-rise ${mounted ? "pd-in" : ""}`}>
          <div className="relative w-16 h-16 mb-5">
            <svg viewBox="0 0 100 100" className="absolute inset-0 pd-seal-sheen" style={{ opacity: 0.55 }}>
              <polygon
                points="50,2 78,15 96,42 91,73 65,95 35,95 9,73 4,42 22,15"
                fill="none"
                stroke="url(#pd-gold-grad)"
                strokeWidth="1"
              />
              <defs>
                <linearGradient id="pd-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#cba874" stopOpacity="0" />
                  <stop offset="45%" stopColor="#f1e4c4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#cba874" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <svg viewBox="0 0 100 100" className="absolute inset-0">
              <polygon
                points="50,2 78,15 96,42 91,73 65,95 35,95 9,73 4,42 22,15"
                fill="#0a0f1f"
                stroke="#cba874"
                strokeOpacity="0.4"
                strokeWidth="1"
              />
              <polygon
                points="50,2 78,15 96,42 91,73 65,95 35,95 9,73 4,42 22,15"
                fill="none"
                stroke="#cba874"
                strokeOpacity="0.18"
                strokeWidth="1"
                transform="scale(0.72)"
                style={{ transformOrigin: "50px 50px" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center pd-font-display italic text-[#f1e4c4] text-lg tracking-wide">
              P&D
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="h-[1px] w-6 bg-[#cba874]/30" />
            <span className="text-[10px] tracking-[0.4em] font-medium text-[#cba874] uppercase pd-font-body">
              Admin Access
            </span>
            <span className="h-[1px] w-6 bg-[#cba874]/30" />
          </div>
          <h1 className="text-3xl sm:text-4xl pd-font-display italic font-light tracking-wide text-stone-100">
            P&D Luxury Jewellery
          </h1>
          <p className="text-[13px] pd-font-body font-medium tracking-widest text-neutral-500 uppercase mt-2.5">
            {isLogin ? "Sign in to the collection ledger" : "Request atelier credentials"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`flex justify-center space-x-8 border-b border-neutral-800/60 max-w-xs mx-auto px-4 pd-rise pd-d1 ${mounted ? "pd-in" : ""}`}>
          <button
            type="button"
            onClick={() => switchMode(true)}
            className={`pb-3 text-xs tracking-[0.2em] uppercase transition-colors duration-300 relative pd-font-body ${
              isLogin ? "text-[#e8cd9c] font-semibold" : "text-neutral-500 hover:text-neutral-300 font-medium"
            }`}
          >
            Sign In
            <span
              className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#cba874] transition-transform duration-500 origin-left ${
                isLogin ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
          <button
            type="button"
            onClick={() => switchMode(false)}
            className={`pb-3 text-xs tracking-[0.2em] uppercase transition-colors duration-300 relative pd-font-body ${
              !isLogin ? "text-[#e8cd9c] font-semibold" : "text-neutral-500 hover:text-neutral-300 font-medium"
            }`}
          >
            Request Access
            <span
              className={`absolute bottom-0 left-0 w-full h-[1px] bg-[#cba874] transition-transform duration-500 origin-left ${
                !isLogin ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        </div>

        {/* Jewel-cut card — corners faceted like an emerald cut */}
        <div
          className={`relative p-[1px] pd-rise pd-d2 ${mounted ? "pd-in" : ""} ${phase === PHASE.DENIED ? "pd-shake" : ""}`}
          style={{
            clipPath:
              "polygon(28px 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%, 0 28px)",
            background:
              "linear-gradient(135deg, rgba(203,168,116,0.55), rgba(203,168,116,0.08) 30%, rgba(203,168,116,0.08) 70%, rgba(203,168,116,0.4))",
          }}
        >
          <div
            className="relative overflow-hidden p-8 sm:p-10"
            style={{
              clipPath:
                "polygon(28px 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%, 0 28px)",
              background:
                "radial-gradient(140% 100% at 50% -10%, #0d1a30 0%, #060a14 55%, #020617 100%)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {!isLogin && (
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] pd-font-body font-semibold tracking-[0.15em] uppercase text-neutral-400 block ml-0.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
                      <FiUser className="w-3.5 h-3.5 stroke-[1.5]" />
                    </span>
                    <input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g., Alexander Vance"
                      className="w-full bg-[#020617]/70 border border-neutral-800/80 rounded-xl pl-11 pr-4 py-3 text-xs pd-font-body text-stone-200 placeholder-neutral-600 focus:outline-none focus:border-[#cba874]/40 focus:bg-[#020617] transition-all tracking-wide"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] pd-font-body font-semibold tracking-[0.15em] uppercase text-neutral-400 block ml-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
                    <FiMail className="w-3.5 h-3.5 stroke-[1.5]" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={isLogin ? "curator@maison.com" : "your.email@domain.com"}
                    className="w-full bg-[#020617]/70 border border-neutral-800/80 rounded-xl pl-11 pr-4 py-3 text-xs pd-font-body text-stone-200 placeholder-neutral-600 focus:outline-none focus:border-[#cba874]/40 focus:bg-[#020617] transition-all tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-[10px] pd-font-body font-semibold tracking-[0.15em] uppercase text-neutral-400 block ml-0.5">
                  Security Passcode
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none">
                    <FiLock className="w-3.5 h-3.5 stroke-[1.5]" />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-[#020617]/70 border border-neutral-800/80 rounded-xl pl-11 pr-11 py-3 text-xs pd-font-body text-stone-200 placeholder-neutral-600 focus:outline-none focus:border-[#cba874]/40 focus:bg-[#020617] transition-all tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none transition-colors duration-300"
                  >
                    {showPassword ? <FiEyeOff className="w-3.5 h-3.5 stroke-[1.5]" /> : <FiEye className="w-3.5 h-3.5 stroke-[1.5]" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-[11px] pd-font-body tracking-wide">
                  <label className="flex items-center gap-2 text-neutral-500 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-[4px] border border-neutral-700 bg-[#020617] accent-[#cba874] cursor-pointer"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast("Contact your system administrator to reset your passcode.", { icon: "🔒" })
                    }
                    className="text-[#cba874]/80 hover:text-[#e8cd9c] transition-colors"
                  >
                    Forgot passcode?
                  </button>
                </div>
              )}

              {/* Seal / submit — the login moment, cut like a faceted gem */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isBusy}
                  className={`w-full relative overflow-hidden text-neutral-950 text-xs font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_24px_rgba(203,168,116,0.18)] focus:outline-none uppercase tracking-[0.2em] pd-font-body ${
                    phase === PHASE.DENIED
                      ? "bg-gradient-to-b from-[#a23b4a] to-[#7c2335] text-[#f4e4e4]"
                      : "bg-gradient-to-b from-[#e8cd9c] to-[#cba874] hover:from-[#f1dcac] hover:to-[#d6b785] disabled:cursor-not-allowed"
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {phase === PHASE.SEALING && (
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 pd-gem-spin">
                        <polygon points="12,2 20,9 17,22 7,22 4,9" fill="none" stroke="#020617" strokeWidth="1.6" />
                      </svg>
                    )}
                    {phase === PHASE.GRANTED && <FiCheck className="w-3.5 h-3.5 pd-check-pop" />}
                    {phase === PHASE.DENIED && <FiX className="w-3.5 h-3.5" />}
                    {phase === PHASE.SEALING && (isLogin ? "Verifying credentials" : "Submitting request")}
                    {phase === PHASE.GRANTED && (isLogin ? "Access granted" : "Request received")}
                    {phase === PHASE.DENIED && "Access denied"}
                    {phase === PHASE.IDLE && (isLogin ? "Sign In" : "Request Registry")}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className={`text-center text-[10px] pd-font-body font-medium tracking-[0.2em] text-neutral-600 uppercase pd-rise pd-d3 ${mounted ? "pd-in" : ""}`}>
          Secured Enterprise Ledger
        </div>
      </div>
    </div>
  );
} 