import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { DeleteModal } from "../components/DeleteModal";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit3, 
  FiTrash2, 
  FiEye 
} from "react-icons/fi";

const getStatusBadge = (status, stock) => {
  if (status === "out_of_stock" || stock === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
        Out of Stock
      </span>
    );
  }
  if (status === "low_stock" || stock < 10) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
        Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      In Stock
    </span>
  );
};

export function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get("/products/get-products"),
          api.get("/categories/get-categories")
        ]);

        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }
        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch initial data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleDeleteProduct = async () => {
    const { productId } = deleteModal;
    const loadToast = toast.loading("Deleting product...");
    try {
      const { data } = await api.delete(`/products/delete-product/${productId}`);
      if (data.success) {
        toast.success("Product deleted successfully", { id: loadToast });
        setProducts(prev => prev.filter(p => p._id !== productId));
      }
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error(error.response?.data?.message || "Failed to delete product", { id: loadToast });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || 
      product.category?._id === categoryFilter || 
      product.category?.name === categoryFilter || 
      product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        onConfirm={handleDeleteProduct}
        title="Delete Product"
        message="Are you sure you want to permanently delete this jewelry item from the inventory?"
      />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Products</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your jewelry inventory and products
          </p>
        </div>
        <Link to="/add-product">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 transition-colors rounded-xl shadow-sm w-full sm:w-auto">
            <FiPlus className="w-4 h-4" />
            Add Product
          </button>
        </Link>
      </div>

      {/* Filter and Table Card Wrapper */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm">
        
        {/* Controls Header Container */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input Custom Component */}
            <div className="relative flex-1">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Action Buttons & Select Layout */}
            <div className="flex gap-2.5">
              <div className="relative">
                <select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl pl-4 pr-10 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>

              <button 
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-300 bg-slate-950 border border-slate-800 hover:bg-slate-800/50 hover:text-white transition-all rounded-xl"
              >
                <FiFilter className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content Table Layout Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Material</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Stock</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-center font-medium w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-800/10 transition-colors group">
                    {/* Product Name & Visual Image thumbnail */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]?.url || product.images?.[0]}
                          alt={product.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-800 flex-shrink-0"
                        />
                        <span className="font-medium text-slate-200 hover:text-amber-500 transition-colors cursor-pointer">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    
                    {/* Serial tracking blocks */}
                    <td className="py-3.5 px-4 font-mono text-slate-400">{product.sku}</td>
                    <td className="py-3.5 px-4 text-slate-300">{product.category?.name || product.category}</td>
                    <td className="py-3.5 px-4 text-slate-400">{product.material}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      ₹{product.price.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{product.stock}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(product.status, product.stock)}</td>
                    
                    {/* Inline Button Action Row */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/product-details/${product._id}`}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </Link>
                        
                        <Link 
                          to={`/edit-product/${product._id}`}
                          title="Edit Product"
                          className="p-2 text-slate-400 hover:text-amber-500 bg-slate-950 border border-slate-800/60 hover:border-amber-500/30 rounded-lg transition-all"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                        </Link>

                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, productId: product._id })}
                          title="Delete Product"
                          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500 font-medium">
                    No products found matching your search options.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}