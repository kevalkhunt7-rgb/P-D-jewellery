import { useState, useEffect } from "react";
import api from "../utils/api";
import { FiPackage, FiAlertTriangle, FiTrendingDown, FiEdit3, FiX, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

export function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState(null);
  const [newStock, setNewStock] = useState("");

  const fetchInventory = async () => {
    try {
      const { data } = await api.get("/products/get-products");
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Failed to fetch inventory", error);
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async (productId) => {
    if (!newStock || isNaN(newStock)) {
      return toast.error("Please enter a valid stock number");
    }

    const loadToast = toast.loading("Updating stock...");
    try {
      const { data } = await api.put(`/products/update-product/${productId}`, { stock: parseInt(newStock) });
      if (data.success) {
        toast.success("Stock updated successfully", { id: loadToast });
        setAdjustingId(null);
        setNewStock("");
        fetchInventory();
      }
    } catch (error) {
      console.error("Failed to update stock", error);
      toast.error(error.response?.data?.message || "Failed to update stock", { id: loadToast });
    }
  };

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Heading Group */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Inventory</h1>
        <p className="text-xs text-slate-400 mt-0.5">Track and manage product stock levels</p>
      </div>

      {/* Analytics Matrix Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Total Products</p>
            <FiPackage className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">{totalProducts}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Low Stock</p>
            <FiAlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2 tracking-tight">{lowStockCount}</p>
        </div>

        {/* Out of Stock */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Out of Stock</p>
            <FiTrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-500 mt-2 tracking-tight">{outOfStockCount}</p>
        </div>

        {/* Total Value */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Total Value</p>
            <FiPackage className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-white mt-2 tracking-tight">
            {totalInventoryValue >= 1000000
              ? `₹${(totalInventoryValue / 1000000).toFixed(1)}M`
              : `₹${totalInventoryValue.toLocaleString("en-IN")}`}
          </p>
        </div>
      </div>

      {/* Main Inventory Board Table */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-bold text-white tracking-wide">Stock Status</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Product</th>
                <th className="py-3 px-4 font-medium">SKU</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Total Stock</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {products.map((item) => (
                <tr key={item._id} className="hover:bg-slate-800/10 transition-colors">

                  {/* Name */}
                  <td className="py-3.5 px-5 font-semibold text-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.images?.[0]?.url || item.images?.[0]}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-800"
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>

                  {/* SKU Monospace tag */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/50">
                      {item.sku || 'N/A'}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 text-slate-400">
                    {item.category?.name || item.category || 'Uncategorized'}
                  </td>

                  {/* Total Stock */}
                  <td className="py-3.5 px-4 text-slate-300 font-medium">
                    {item.stock}
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4 text-slate-200 font-bold">
                    ₹{item.price.toLocaleString()}
                  </td>

                  {/* Operational Context Stock Status Badges */}
                  <td className="py-3.5 px-4">
                    {item.stock === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Out of Stock
                      </span>
                    ) : item.stock < 10 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        In Stock
                      </span>
                    )}
                  </td>

                  {/* Functional Stock Modifier Action Row */}
                  <td className="py-3.5 px-5 text-right">
                    {adjustingId === item._id ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={newStock}
                          onChange={(e) => setNewStock(e.target.value)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/50"
                          placeholder="Stock"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAdjustStock(item._id)}
                          className="p-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-slate-950 transition-all"
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setAdjustingId(null);
                            setNewStock("");
                          }}
                          className="p-1.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAdjustingId(item._id);
                          setNewStock(item.stock.toString());
                        }}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-[11px] font-bold bg-slate-950 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700 active:scale-[0.98] rounded-lg transition-all"
                      >
                        Adjust Stock
                      </button>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}