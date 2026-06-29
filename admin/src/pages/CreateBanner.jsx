import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiUpload, 
  FiX, 
  FiMonitor 
} from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";

export function CreateBanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [desktopImage, setDesktopImage] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  
  // Toggle states for the custom semantic switches
  const [autoRotate, setAutoRotate] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    displayOrder: 1,
    status: "active",
    audience: "all"
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      setDesktopImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      return toast.error("Title is required");
    }
    if (!desktopFile) {
      return toast.error("Desktop banner image is required");
    }

    const loadToast = toast.loading("Creating banner...");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("description", formData.description);
      data.append("buttonText", formData.buttonText);
      data.append("buttonLink", formData.buttonLink);
      data.append("position", formData.displayOrder);
      data.append("isActive", formData.status === "active");

      // Backend expects 'image' file
      data.append("image", desktopFile);

      const response = await api.post("/banners/create", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        toast.success("Banner created successfully", { id: loadToast });
        navigate("/banners");
      }
    } catch (error) {
      console.error("Create banner error:", error);
      toast.error(error.response?.data?.message || "Failed to create banner", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl text-slate-200 p-1">
      {/* Header Panel */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Banner</h1>
          <p className="text-xs text-slate-400 mt-0.5">Create a new promotional banner configuration</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Fields */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-xs font-semibold text-slate-300">
                  Banner Title <span className="text-amber-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Collection 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="subtitle" className="text-xs font-semibold text-slate-300">Subtitle</label>
                <input
                  id="subtitle"
                  type="text"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="e.g., 25% Off All Necklaces"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Banner description or tagline..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Banner Asset Upload Segment */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Banner Images</h2>
            
            {/* Context Header indicating Desktop preference */}
            <div className="bg-slate-950 border border-slate-800/60 p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold text-slate-300">
              <FiMonitor className="w-3.5 h-3.5 text-amber-500" />
              <span>Desktop Layout Asset</span>
            </div>

            {/* Upload Area */}
            <div className="mt-4">
              {desktopImage ? (
                <div className="relative border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={desktopImage}
                    alt="Desktop banner preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setDesktopImage(null);
                      setDesktopFile(null);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950/70 transition-all group">
                  <FiUpload className="w-10 h-10 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  <div>
                    <p className="text-xs font-bold text-slate-300">Upload Desktop Banner</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Recommended scale constraints: 1920×600px</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Triggers / Call to Action Links */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Call to Action</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="buttonText" className="text-xs font-semibold text-slate-300">Button Text</label>
                <input
                  id="buttonText"
                  type="text"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Now"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="buttonLink" className="text-xs font-semibold text-slate-300">Button Link</label>
                <input
                  id="buttonLink"
                  type="text"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  placeholder="/products"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Configuration Blocks */}
        <div className="space-y-6">
          
          {/* Status Matrix */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Status & Layout</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-semibold text-slate-300">Banner Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="displayOrder" className="text-xs font-semibold text-slate-300">Display Order</label>
                <input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Lower indices receive evaluation weight priority positioning inside lists
                </p>
              </div>

              {/* Semantic Check Switch Container (Auto Rotate) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="space-y-0.5 max-w-[75%]">
                  <p className="text-xs font-bold text-slate-300">Auto Rotate</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Include inside multi-carousel structures on target routes
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoRotate(!autoRotate)}
                  className={`w-10 h-5 rounded-full relative transition-colors border focus:outline-none ${
                    autoRotate ? "bg-amber-500 border-amber-400" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full shadow-md transition-transform transform ${
                      autoRotate ? "translate-x-5 bg-slate-950" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Target Segments */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Target Audience</h2>
            <div className="space-y-1.5 pt-1">
              <label htmlFor="audience" className="text-xs font-semibold text-slate-300">Show To</label>
              <select
                id="audience"
                value={formData.audience}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
              >
                <option value="all">All Visitors</option>
                <option value="new">New Visitors</option>
                <option value="returning">Returning Customers</option>
                <option value="vip">VIP Customers</option>
              </select>
            </div>
          </div>

          {/* Real-Time Preview Block */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Preview</h2>
            <div className="space-y-3">
              <div className="aspect-video bg-slate-950 border border-slate-800/60 rounded-xl flex items-center justify-center overflow-hidden">
                {desktopImage ? (
                  <img src={desktopImage} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">Banner layout snapshot sandbox</p>
                )}
              </div>
              <p className="text-[11px] text-slate-500 text-center leading-normal">
                Populate or attach graphical assets above to trigger render previews
              </p>
            </div>
          </div>

          {/* Core Controls Persistence Blocks */}
          <div className="space-y-2.5 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/5 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Banner"}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}