import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiPlus, FiEdit3, FiTrash2, FiX } from "react-icons/fi";
import { DeleteModal } from "../components/DeleteModal";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export function Categories() {
  const [categoriesData, setCategoriesData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, categoryId: null });

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: null
  });

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/categories/get-categories");
      if (data.success) {
        setCategoriesData(data.categories);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id === 'cat-name' ? 'name' : 'slug']: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleCreateCategory = async () => {
    if (!formData.name) return toast.error("Category name is required");
    setCreateLoading(true);
    const loadToast = toast.loading("Creating category...");
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug || formData.name.toLowerCase().replace(/ /g, '-'));
      if (formData.image) {
        data.append("image", formData.image);
      }

      const response = await api.post("/categories/add-category", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success("Category created successfully!", { id: loadToast });
        setIsModalOpen(false);
        setFormData({ name: "", slug: "", image: null });
        fetchCategories();
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(error.response?.data?.message || "Failed to create category", { id: loadToast });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    const { categoryId } = deleteModal;
    const loadToast = toast.loading("Deleting category...");
    try {
      const { data } = await api.delete(`/categories/delete-category/${categoryId}`);
      if (data.success) {
        toast.success("Category deleted successfully", { id: loadToast });
        setCategoriesData(prev => prev.filter(c => c._id !== categoryId));
        setDeleteModal({ isOpen: false, categoryId: null });
      }
    } catch (error) {
      console.error("Failed to delete category", error);
      toast.error(error.response?.data?.message || "Failed to delete category", { id: loadToast });
    }
  };

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, categoryId: null })}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will affect all jewelry items associated with it."
      />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Categories</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors rounded-xl shadow-sm w-full sm:w-auto"
        >
          <FiPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Category Visual Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoriesData.map((category) => (
          <div key={category._id} className="bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group">
            <div>
              <div className="h-32 w-full overflow-hidden border-b border-slate-800/40">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{category.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Category</p>
                </div>

                {/* Redesigned Card Action Suite */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Link 
                    to={`/edit-category/${category._id}`}
                    title="Edit Category"
                    className="p-2 text-slate-400 hover:text-amber-500 bg-slate-950 border border-slate-800/60 hover:border-amber-500/30 rounded-lg transition-all"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" />
                  </Link>
                  <button 
                    title="Delete Category"
                    onClick={() => setDeleteModal({ isOpen: true, categoryId: category._id })}
                    className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5 pt-0">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                {category.status || 'Active'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Overview Categories Table Block */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-800/60">
          <h2 className="text-sm font-semibold text-white">All Categories</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Slug</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-center font-medium w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {categoriesData.map((category) => (
                <tr key={category._id} className="hover:bg-slate-800/10 transition-colors group">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                      />
                      <span className="font-medium text-slate-200">{category.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{category.slug}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {category.status || 'Active'}
                    </span>
                  </td>
                  
                  {/* Redesigned Table Row Action Suite */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/edit-category/${category._id}`}
                        title="Edit Category"
                        className="p-2 text-slate-400 hover:text-amber-500 bg-slate-950 border border-slate-800/60 hover:border-amber-500/30 rounded-lg transition-all"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button 
                        title="Delete Category"
                        onClick={() => setDeleteModal({ isOpen: true, categoryId: category._id })}
                        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pure Native React Modal Dialog Portal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsModalOpen(false)}
          />
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl z-50 transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="mb-5 pr-6">
              <h3 className="text-base font-semibold text-white">Create New Category</h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Add a new category to organize your jewelry products.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label htmlFor="cat-name" className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                  Category Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Necklaces"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cat-slug" className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                  Slug
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="e.g., necklaces"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="cat-image" className="text-[11px] font-semibold text-slate-300 tracking-wide uppercase">
                  Category Image
                </label>
                <input
                  id="cat-image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-400 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50 transition-colors file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 file:transition-colors file:cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800/50 hover:text-white transition-all rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={createLoading}
                className="px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 transition-colors rounded-xl shadow-sm"
              >
                {createLoading ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}