import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { 
  FiArrowLeft, 
  FiUpload, 
  FiX, 
  FiMonitor, 
  FiSmartphone 
} from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";

export function EditBanner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [desktopImage, setDesktopImage] = useState(null);
  const [desktopFile, setDesktopFile] = useState(null);
  const [mobileImage, setMobileImage] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [activeTab, setActiveTab] = useState("desktop");
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    position: "home-hero",
    displayOrder: 1,
    status: "active",
    audience: "all"
  });

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await api.get(`/banners/${id}`);
        if (data.success) {
          const b = data.banner;
          setFormData({
            title: b.title || "",
            subtitle: b.subtitle || "",
            description: b.description || "",
            buttonText: b.buttonText || "",
            buttonLink: b.buttonLink || "",
            position: b.bannerType === "hero" ? "home-hero" : "promotion",
            displayOrder: b.position || 1,
            status: b.isActive ? "active" : "inactive",
            audience: b.audience || "all"
          });
          if (b.image?.url) setDesktopImage(b.image.url);
          if (b.mobileImage?.url) setMobileImage(b.mobileImage.url);
        }
      } catch (error) {
        console.error("Failed to fetch banner", error);
        toast.error("Failed to load banner data");
        navigate("/banners");
      } finally {
        setFetching(false);
      }
    };
    fetchBanner();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "desktop") {
        setDesktopFile(file);
        setDesktopImage(URL.createObjectURL(file));
      } else {
        setMobileFile(file);
        setMobileImage(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      return toast.error("Title is required");
    }

    const loadToast = toast.loading("Updating banner...");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("subtitle", formData.subtitle);
      data.append("description", formData.description);
      data.append("buttonText", formData.buttonText);
      data.append("buttonLink", formData.buttonLink);
      data.append("bannerType", formData.position === "home-hero" ? "hero" : "promotion");
      data.append("position", formData.displayOrder);
      data.append("isActive", formData.status === "active");

      // Appends current files or indicators if cleared completely
      if (desktopFile) {
        data.append("image", desktopFile);
      } else if (!desktopImage) {
        data.append("imageRemoved", "true");
      }

      if (mobileFile) {
        data.append("mobileImage", mobileFile);
      } else if (!mobileImage) {
        data.append("mobileImageRemoved", "true");
      }

      const response = await api.put(`/banners/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.success) {
        toast.success("Banner updated successfully", { id: loadToast });
        navigate("/banners");
      }
    } catch (error) {
      console.error("Update banner error:", error);
      toast.error(error.response?.data?.message || "Failed to update banner", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Edit Banner</h1>
          <p className="text-xs text-slate-400 mt-0.5">Modify banner configuration and assets</p>
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
                  placeholder="e.g., Summer Collection"
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
                  placeholder="e.g., 25% Off All Items"
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
            
            <div className="bg-slate-950 border border-slate-800/60 p-1 rounded-xl flex gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("desktop")}
                className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                  activeTab === "desktop"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FiMonitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mobile")}
                className={`flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-1.5 rounded-lg transition-all ${
                  activeTab === "mobile"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FiSmartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>

            <div className="mt-4">
              {activeTab === "desktop" && (
                <div className="space-y-4">
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
                        <p className="text-[11px] text-slate-500 mt-0.5">Recommended scale: 1920×600px</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, "desktop")}
                      />
                    </label>
                  )}
                </div>
              )}

              {activeTab === "mobile" && (
                <div className="space-y-4">
                  {mobileImage ? (
                    <div className="relative max-w-xs mx-auto border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <img
                        src={mobileImage}
                        alt="Mobile banner preview"
                        className="w-full h-80 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMobileImage(null);
                          setMobileFile(null);
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
                        <p className="text-xs font-bold text-slate-300">Upload Mobile Banner</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Recommended scale: 720×1280px</p>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(e, "mobile")}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Display Settings</h2>
            
            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <label htmlFor="displayOrder" className="text-xs font-semibold text-slate-300">Display Order</label>
                <input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Button Settings</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="buttonText" className="text-xs font-semibold text-slate-300">Button Text</label>
                <input
                  id="buttonText"
                  type="text"
                  value={formData.buttonText}
                  onChange={handleInputChange}
                  placeholder="e.g., Shop Now"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="buttonLink" className="text-xs font-semibold text-slate-300">Button Link</label>
                <input
                  id="buttonLink"
                  type="text"
                  value={formData.buttonLink}
                  onChange={handleInputChange}
                  placeholder="e.g., /products"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-2xl shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98]"
          >
            {loading ? "Updating..." : "Update Banner"}
          </button>
        </div>
      </div>
    </form>
  );
}