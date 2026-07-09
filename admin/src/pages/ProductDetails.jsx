import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FiArrowLeft, FiEdit3, FiTrash2, FiPackage, FiLayers, FiTag, FiCalendar } from "react-icons/fi";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/get-product/${id}`);
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>;
  if (!product) return <div className="p-8 text-white">Product not found</div>;

  const specifications = Array.isArray(product.specifications)
    ? product.specifications.filter(
        (item) => item?.label && item?.value !== undefined && item?.value !== null && String(item.value).trim() !== ""
      )
    : [];

  return (
    <div className="space-y-6 text-slate-200 p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">Product Details</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Images Gallery */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden aspect-square">
            <img 
              src={product.images?.[0]?.url || product.images?.[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.map((img, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden aspect-square">
                <img src={img.url || img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{product.name}</h2>
                <p className="text-amber-500 font-mono text-sm mt-1">{product.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">₹{product.price.toLocaleString()}</p>
                {product.originalPrice > product.price && (
                  <p className="text-slate-500 line-through">₹{product.originalPrice.toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-slate-800">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Category</p>
                <p className="text-sm font-semibold text-slate-200">{product.category?.name || product.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Stock</p>
                <p className={`text-sm font-semibold ${product.stock < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>{product.stock} Units</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Status</p>
                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase">{product.status}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Description</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{product.description}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Product Specifications</h3>
              {specifications.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {product.specifications.map((specification, index) => {
                    const value = specification?.value;

                    if (!specification?.label || value === undefined || value === null || String(value).trim() === "") {
                      return null;
                    }

                    return (
                      <div key={`${specification.label}-${index}`} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1.5">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                          {specification.label}
                        </p>
                        <p className="text-sm font-semibold text-slate-100 break-words">
                          {specification.value}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No specifications available.</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={() => navigate(`/edit-product/${product._id}`)}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-slate-950 font-bold py-3 rounded-2xl hover:bg-amber-400 transition-all"
              >
                <FiEdit3 className="w-4 h-4" />
                Edit Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
