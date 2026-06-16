import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FiArrowLeft, FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

export function EditCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "active",
    image: null
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const { data } = await api.get(`/categories/get-categories`);
        if (data.success) {
          const category = data.categories.find(c => c._id === id);
          if (category) {
            setFormData({
              name: category.name || "",
              slug: category.slug || "",
              status: category.status || "active",
              image: null
            });
            setPreview(category.image);
          } else {
            toast.error("Category not found");
            navigate("/categories");
          }
        }
      } catch (error) {
        console.error("Failed to fetch category", error);
        toast.error("Failed to load category data");
      } finally {
        setFetching(false);
      }
    };
    fetchCategory();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'cat-name' ? 'name' : id === 'cat-slug' ? 'slug' : id]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Category name is required");
    
    setLoading(true);
    const loadToast = toast.loading("Updating category...");
    
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("status", formData.status);
      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await api.put(`/categories/update-category/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Category updated successfully!", { id: loadToast });
        navigate("/categories");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error(error.response?.data?.message || "Failed to update category", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center min-h-screen text-white">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto text-slate-200 p-4">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Category</h1>
          <p className="text-xs text-slate-400 mt-0.5">Modify category details and image</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category Name</label>
            <input 
              id="cat-name" 
              type="text" 
              value={formData.name} 
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Slug</label>
            <input 
              id="cat-slug" 
              type="text" 
              value={formData.slug} 
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</label>
            <select 
              id="status" 
              value={formData.status} 
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Category Image</label>
            <div className="flex items-start gap-4">
              <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950/50 cursor-pointer text-slate-500 hover:text-amber-500 transition-all">
                  <FiUpload className="w-6 h-6 mb-2" />
                  <span className="text-xs font-medium">Change Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-3 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded-2xl hover:bg-slate-900 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 py-3 bg-amber-500 text-slate-950 font-bold rounded-2xl hover:bg-amber-400 disabled:bg-slate-700 transition-all shadow-lg shadow-amber-500/10"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
