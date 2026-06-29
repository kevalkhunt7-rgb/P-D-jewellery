import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLock, FiMail, FiEye, FiEyeOff, FiTerminal, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import toast from "react-hot-toast";

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success("Successfully logged in as Admin!");
        navigate("/");
      } else {
        const isConnectionError = result.message.toLowerCase().includes("network error") || result.message.toLowerCase().includes("failed to fetch");
        if (isConnectionError) {
          toast.error("Could not connect to the server. Please ensure the backend is running.");
        } else {
          toast.error(result.message);
        }
      }
    } else {
      try {
        const { data } = await api.post("/admin/admin-requests", {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (data.success) {
          toast.success("Admin request submitted! Waiting for approval.");
          setIsLogin(true);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to submit request");
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-slate-200">
      <div className="w-full max-w-md space-y-8">
        
        {/* Core Brand Header Accent */}
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 mb-4 animate-pulse">
            <FiTerminal className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">
            Control Panel Access
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin ? "Authorize administrative token access to proceed" : "Request admin access"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 bg-slate-900 border border-slate-800/80 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              isLogin
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !isLogin
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Request Access
          </button>
        </div>

        {/* Auth Interface Card Wrapper */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name field for register */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                    <FiUser className="w-4 h-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Identity Anchor (Email String) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={isLogin ? "admin@internal.system" : "your@email.com"}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Cryptographic Proof Field (Password Key) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-400">
                  Password
                </label>
                {isLogin && (
                  <a 
                    href="#recovery" 
                    className="text-[11px] text-slate-500 hover:text-amber-500 transition-colors"
                  >
                    Forgot Password?
                  </a>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Flag Selection Check (only for login) */}
            {isLogin && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group max-w-fit select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                      rememberMe ? "border-amber-500 bg-amber-500/10" : "border-slate-800 bg-slate-950"
                    }`}>
                      {rememberMe && (
                        <div className="w-1.5 h-1.5 rounded-sm bg-amber-500" />
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                    Remember Me
                  </span>
                </label>
              </div>
            )}

            {/* Execute Request Actions Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/5 focus:outline-none uppercase tracking-wider"
              >
                {loading 
                  ? (isLogin ? 'Authenticating...' : 'Submitting Request...') 
                  : (isLogin ? 'Login As Administrator' : 'Submit Admin Request')}
              </button>
            </div>
          </form>
        </div>
        
      </div>
    </div>
  );
}