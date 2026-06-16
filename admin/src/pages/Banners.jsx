import { useState, useEffect } from "react";
import { FiPlus, FiEye, FiEyeOff, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { DeleteModal } from "../components/DeleteModal";

export function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, bannerId: null });

  const fetchBanners = async () => {
    try {
      const { data } = await api.get("/banners/admin/all");
      if (data.success) {
        setBanners(data.banners);
      }
    } catch (error) {
      console.error("Failed to fetch banners", error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const toggleBannerStatus = async (id, currentStatus) => {
    try {
      const { data } = await api.put(`/banners/update/${id}`, { isActive: !currentStatus });
      if (data.success) {
        toast.success(`Banner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchBanners();
      }
    } catch (error) {
      console.error("Failed to toggle banner status", error);
      toast.error("Failed to update status");
    }
  };

  const deleteBanner = async () => {
    const { bannerId } = deleteModal;
    const deleteToast = toast.loading("Deleting banner...");
    try {
      const { data } = await api.delete(`/banners/delete/${bannerId}`);
      if (data.success) {
        toast.success("Banner deleted successfully", { id: deleteToast });
        setBanners(banners.filter(b => b._id !== bannerId));
        setDeleteModal({ isOpen: false, bannerId: null });
      }
    } catch (error) {
      console.error("Failed to delete banner", error);
      toast.error("Failed to delete banner", { id: deleteToast });
    }
  };

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bannerId: null })}
        onConfirm={deleteBanner}
        title="Delete Banner"
        message="Are you sure you want to delete this promotional banner? This action cannot be undone."
      />
      
      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl z-10 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
            <img 
              src={previewImage} 
              alt="Banner Preview" 
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Top Header Controls row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Banners</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage promotional banners and sliders</p>
        </div>
        <Link to="/create-banner">
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-amber-500/10">
          <FiPlus className="w-4 h-4 stroke-[3]" />
          Create Banner
        </button>
        </Link>
      </div>

      {/* Dynamic Grid Rendering */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {banners.map((banner) => (
          <div 
            key={banner._id} 
            className="group relative bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500/20 transition-all duration-300"
          >
            {/* Visual Preview Layer Container */}
            <div 
              className="aspect-[21/9] w-full relative overflow-hidden bg-slate-950 cursor-pointer"
              onClick={() => setPreviewImage(banner.image?.url)}
            >
              <img
                src={banner.image?.url}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Conditional Visibility Badge */}
              <div className="absolute top-4 left-4">
                {banner.isActive ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    Visible
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 backdrop-blur-md text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Banner Metadata & Actions */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{banner.subtitle}</p>
                </div>
                
                {/* Status Toggle Switch Block */}
                <button
                  onClick={() => toggleBannerStatus(banner._id, banner.isActive)}
                  className={`p-2.5 rounded-2xl border transition-all duration-200 ${
                    banner.isActive 
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-slate-900" 
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                  }`}
                  title={banner.isActive ? "Hide Banner" : "Show Banner"}
                >
                  {banner.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Bottom Metadata row */}
              <div className="mt-6 pt-5 border-t border-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Position</p>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5">#{banner.position}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Clickthrough</p>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5">{banner.buttonLink ? "Active" : "None"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link 
                    to={`/edit-banner/${banner._id}`}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <FiEdit3 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => setDeleteModal({ isOpen: true, bannerId: banner._id })}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-all"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}