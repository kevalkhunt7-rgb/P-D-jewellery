import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-6 overflow-hidden relative selection:bg-amber-500/30">
      
      {/* Animated Space Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping [animation-duration:3s]" />
        <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-duration:4s]" />
        <div className="absolute bottom-1/4 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-ping [animation-duration:5s]" />
        <div className="absolute bottom-1/3 left-1/5 w-2 h-2 bg-slate-500 rounded-full opacity-20 animate-bounce [animation-duration:8s]" />
      </div>

      {/* Main Content Box */}
      <div className="flex flex-col items-center max-w-lg text-center z-10 space-y-8">
        
        {/* Animated Cartoon Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          
          {/* Radar Glow Background */}
          <div className="absolute w-48 h-48 bg-amber-500/5 rounded-full border border-amber-500/10 animate-ping [animation-duration:4s]" />
          <div className="absolute w-56 h-56 bg-slate-800/20 rounded-full border border-slate-700/30 animate-pulse" />

          {/* Pure CSS Floating Astronaut Cartoon */}
          <div className="w-40 h-48 relative animate-float">
            {/* Spacesuit Helmet/Head */}
            <div className="w-28 h-28 bg-slate-100 rounded-[35px] mx-auto relative border-4 border-slate-300 shadow-xl flex items-center justify-center">
              {/* Visor Glass */}
              <div className="w-20 h-16 bg-slate-900 rounded-[20px] relative overflow-hidden flex items-center justify-center border-2 border-slate-700">
                {/* Cute Cartoon Eyes */}
                <div className="flex gap-4 animate-blink">
                  <div className="w-2.5 h-4 bg-amber-400 rounded-full" />
                  <div className="w-2.5 h-4 bg-amber-400 rounded-full" />
                </div>
                {/* Glass Reflection Tint */}
                <div className="absolute top-1 right-2 w-8 h-3 bg-white/10 rounded-full rotate-12" />
              </div>
            </div>

            {/* Spacesuit Backpack */}
            <div className="absolute top-24 left-2 w-6 h-16 bg-slate-300 border border-slate-400 rounded-l-lg shadow-inner" />

            {/* Suit Body */}
            <div className="w-24 h-20 bg-slate-200 border-4 border-slate-300 rounded-[24px] mx-auto -mt-2 relative shadow-lg">
              {/* Center Control Panel Emblem */}
              <div className="w-10 h-7 bg-amber-500/10 border border-amber-500/40 rounded-md mx-auto mt-3 flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                <div className="w-3 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>

            {/* Left & Right Dangling Boots */}
            <div className="absolute bottom-1 left-8 w-7 h-6 bg-slate-300 border-2 border-slate-400 rounded-b-xl shadow-md rotate-6" />
            <div className="absolute bottom-1 right-8 w-7 h-6 bg-slate-300 border-2 border-slate-400 rounded-b-xl shadow-md -rotate-6" />
          </div>
        </div>

        {/* Error Typography */}
        <div className="space-y-3">
          <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tighter">
            404
          </h1>
          <h2 className="text-xl font-bold text-white tracking-wide">
            Lost in the Deep Space?
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            The coordinates you provided led into a black hole. The page you are looking for has drifted out of orbit.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link to="/" className="w-full sm:w-auto">
            <button className="w-full inline-flex items-center justify-center px-6 py-3 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-amber-500/10">
              Return to Base Station
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()} 
            className="w-full sm:w-auto px-6 py-3 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
}