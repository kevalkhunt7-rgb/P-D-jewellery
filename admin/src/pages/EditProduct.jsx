import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../utils/api";
import { FiArrowLeft, FiUpload, FiX, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([null, null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null, null]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    price: "",
    originalPrice: "",
    stock: "",
    weight: "",
    material: "",
    plating: "",
    color: "",
    occasion: "",
    stones: "",
    status: "active",
    isTrending: false,
    isNewArrival: false,
    isFeatured: false,
    metaTitle: "",
    metaDesc: "",
    tags: "",
    defaultRating: 0
  });
  const [variants, setVariants] = useState([{ color: "", size: "", stock: 0 }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productRes] = await Promise.all([
          api.get("/categories/get-categories"),
          api.get(`/products/get-product/${id}`)
        ]);

        if (categoriesRes.data.success) {
          setCategories(categoriesRes.data.categories);
        }

        if (productRes.data.success) {
          const product = productRes.data.product;
          if (product) {
            const validStatuses = ["active", "draft", "out_of_stock"];
            const productStatus = product.status?.toLowerCase();

            setFormData({
      name: product.name || "",
      description: product.description || "",
      category: product.category?._id || product.category || "",
      sku: product.sku || "",
      price: product.price || "",
      originalPrice: product.originalPrice || "",
      stock: product.stock || "",
      weight: product.weight || "",
      material: product.material || "",
      plating: product.plating || "",
      color: product.color || "",
      occasion: Array.isArray(product.occasion) ? product.occasion.join(", ") : (product.occasion || ""),
      stones: product.stones || "",
      status: validStatuses.includes(productStatus) ? productStatus : "active",
      isTrending: product.isTrending || false,
      isNewArrival: product.isNewArrival || false,
      isFeatured: product.isFeatured || false,
      metaTitle: product.seoTitle || "",
      metaDesc: product.seoDescription || "",
      tags: Array.isArray(product.tags) ? product.tags.join(", ") : (product.tags || ""),
      defaultRating: product.defaultRating || 0,
      // New premium jewellery fields
      metalType: product.metalType || "Gold",
      purity: product.purity || "22KT",
      grossWeight: product.grossWeight || 0,
      netWeight: product.netWeight || 0,
      metalColor: product.metalColor || "Yellow Gold",
      diamondWeight: product.diamondWeight || 0,
      diamondPieces: product.diamondPieces || 0,
      bisHallmarkNumber: product.bisHallmarkNumber || "",
      certificateDetails: product.certificateDetails || "",
      makingCharges: product.makingCharges || 0,
      gst: product.gst || 3,
      warranty: product.warranty || "Lifetime",
      buybackEligibility: product.buybackEligibility !== undefined ? product.buybackEligibility : true
    });

            if (product.variants) setVariants(product.variants);

            // Set existing images as previews
            const existingPreviews = [...previews];
            product.images?.forEach((img, idx) => {
              if (idx < 5) existingPreviews[idx] = img.url || img;
            });
            setPreviews(existingPreviews);
          }
        }
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = file;
      setImages(newImages);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...previews];
        newPreviews[index] = reader.result;
        setPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newPreviews = [...previews];
    newPreviews[index] = null;
    setPreviews(newPreviews);
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = field === 'stock' ? parseInt(value) || 0 : value;
    setVariants(newVariants);
  };

  const handleAddVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      images.forEach(img => {
        if (img) data.append('images', img);
      });

      data.append('variants', JSON.stringify(variants));

      const response = await api.put(`/products/update-product/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Product updated successfully!");
        navigate("/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex items-center justify-center min-h-screen text-white">Loading product...</div>;

  return (
    <div className="space-y-6 max-w-5xl text-slate-200 p-1">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Edit Product</h1>
          <p className="text-xs text-slate-400 mt-0.5">Modify jewelry item listing</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Basic Information</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300">Product Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-semibold text-slate-300">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sku" className="text-xs font-semibold text-slate-300">SKU *</label>
                <input
                  id="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Product Images (Max 5)</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[0, 1, 2, 3, 4].map((index) => (
                <div key={index} className="relative aspect-square">
                  {previews[index] ? (
                    <div className="relative group w-full h-full rounded-xl overflow-hidden border border-slate-800">
                      <img
                        src={previews[index]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 transition-colors cursor-pointer text-slate-500 hover:text-amber-500">
                      <FiUpload className="w-5 h-5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Pricing & Inventory</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="price" className="text-xs font-semibold text-slate-300">Price *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="originalPrice" className="text-xs font-semibold text-slate-300">Original Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input
                    id="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="stock" className="text-xs font-semibold text-slate-300">Stock Quantity *</label>
                <input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="weight" className="text-xs font-semibold text-slate-300">Weight (grams)</label>
                <input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="defaultRating" className="text-xs font-semibold text-slate-300">Default Rating (0-5)</label>
                <input
                  id="defaultRating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.defaultRating}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Premium Jewellery Details</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="metalType" className="text-xs font-semibold text-slate-300">Metal Type *</label>
                <select
                  id="metalType"
                  value={formData.metalType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Gold-Plated">Gold Plated</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="purity" className="text-xs font-semibold text-slate-300">Purity</label>
                <select
                  id="purity"
                  value={formData.purity}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="18KT">18KT</option>
                  <option value="22KT">22KT</option>
                  <option value="24KT">24KT</option>
                  <option value="925 Sterling">925 Sterling</option>
                  <option value="950 Platinum">950 Platinum</option>
                  <option value="999 Platinum">999 Platinum</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="grossWeight" className="text-xs font-semibold text-slate-300">Gross Weight (grams)</label>
                <input
                  id="grossWeight"
                  type="number"
                  step="0.01"
                  value={formData.grossWeight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="netWeight" className="text-xs font-semibold text-slate-300">Net Weight (grams)</label>
                <input
                  id="netWeight"
                  type="number"
                  step="0.01"
                  value={formData.netWeight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="metalColor" className="text-xs font-semibold text-slate-300">Metal Color</label>
                <select
                  id="metalColor"
                  value={formData.metalColor}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="Yellow Gold">Yellow Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="bisHallmarkNumber" className="text-xs font-semibold text-slate-300">BIS Hallmark Number</label>
                <input
                  id="bisHallmarkNumber"
                  type="text"
                  value={formData.bisHallmarkNumber}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="diamondWeight" className="text-xs font-semibold text-slate-300">Diamond Weight (Carats)</label>
                <input
                  id="diamondWeight"
                  type="number"
                  step="0.01"
                  value={formData.diamondWeight}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="diamondPieces" className="text-xs font-semibold text-slate-300">Number of Diamonds</label>
                <input
                  id="diamondPieces"
                  type="number"
                  value={formData.diamondPieces}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="makingCharges" className="text-xs font-semibold text-slate-300">Making Charges (₹)</label>
                <input
                  id="makingCharges"
                  type="number"
                  value={formData.makingCharges}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="gst" className="text-xs font-semibold text-slate-300">GST (%)</label>
                <input
                  id="gst"
                  type="number"
                  step="0.1"
                  value={formData.gst}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="certificateDetails" className="text-xs font-semibold text-slate-300">Certificate Details</label>
              <textarea
                id="certificateDetails"
                value={formData.certificateDetails}
                onChange={handleInputChange}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="warranty" className="text-xs font-semibold text-slate-300">Warranty</label>
                <input
                  id="warranty"
                  type="text"
                  value={formData.warranty}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="buybackEligibility" className="text-xs font-semibold text-slate-300">Buyback Eligibility</label>
                  <input
                    id="buybackEligibility"
                    type="checkbox"
                    checked={formData.buybackEligibility}
                    onChange={handleInputChange}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="material" className="text-xs font-semibold text-slate-300">Material *</label>
                <select
                  id="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="">Select material</option>
                  <option value="gold">Gold Plated</option>
                  <option value="silver">Silver Plated</option>
                  <option value="rose-gold">Rose Gold Plated</option>
                  <option value="brass">Brass</option>
                  <option value="copper">Copper</option>
                  <option value="alloy">Alloy</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plating" className="text-xs font-semibold text-slate-300">Plating Type</label>
                <select
                  id="plating"
                  value={formData.plating}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="">Select plating</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="rose-gold">Rose Gold</option>
                  <option value="rhodium">Rhodium</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="color" className="text-xs font-semibold text-slate-300">Color</label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                >
                  <option value="">Select color</option>
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="rose-gold">Rose Gold</option>
                  <option value="multicolor">Multicolor</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="occasion" className="text-xs font-semibold text-slate-300">Occasion</label>
                <input
                  id="occasion"
                  type="text"
                  value={formData.occasion}
                  onChange={handleInputChange}
                  placeholder="e.g., Wedding, Party, Casual"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {["Wedding", "Party", "Casual", "Festive", "Daily Wear"].map((occ, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => {
                        const currentOccasions = formData.occasion ? formData.occasion.split(',').map(o => o.trim()) : [];
                        if (!currentOccasions.includes(occ)) {
                          const newOccasions = [...currentOccasions, occ].join(', ');
                          setFormData(prev => ({ ...prev, occasion: newOccasions }));
                        }
                      }}
                      className="bg-slate-950 border border-slate-800 px-2 py-1 text-[9px] font-bold tracking-wide rounded-md text-slate-400 uppercase hover:text-amber-500 transition-colors"
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="stones" className="text-xs font-semibold text-slate-300">Stone/Gems</label>
              <input
                id="stones"
                type="text"
                value={formData.stones}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-white tracking-wide">Product Variants</h2>
              <button
                type="button"
                onClick={handleAddVariant}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors px-2.5 py-1.5 bg-amber-500/5 border border-amber-500/20 rounded-xl hover:bg-amber-500/10"
              >
                <FiPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                Add Variant
              </button>
            </div>
            
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 relative group"
                >
                  <div className="flex-1 grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Color</label>
                      <input 
                        type="text" 
                        value={variant.color}
                        onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/40" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Size</label>
                      <input 
                        type="text" 
                        value={variant.size}
                        onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/40" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Stock</label>
                      <input 
                        type="number" 
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/40" 
                      />
                    </div>
                  </div>
                  
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(index)}
                      className="p-2 bg-slate-900 border border-slate-800 hover:bg-rose-950/30 hover:border-rose-900/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors mb-0.5"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Status</h2>
            <select
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
            >
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Product Tags</h2>
            <div className="space-y-3">
              <input
                id="tags"
                type="text"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Add tags (comma separated)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <div className="flex flex-wrap gap-1.5">
                {["Trending", "New Arrival", "Bestseller"].map((tag, idx) => (
                  <button 
                    key={idx} 
                    type="button"
                    onClick={() => {
                      const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                      if (!currentTags.includes(tag)) {
                        const newTags = [...currentTags, tag].join(', ');
                        setFormData(prev => ({ ...prev, tags: newTags }));
                      }
                    }}
                    className="bg-slate-950 border border-slate-800 px-2 py-1 text-[10px] font-bold tracking-wide rounded-md text-slate-400 uppercase hover:text-amber-500 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">SEO Optimization</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="metaTitle" className="text-xs font-semibold text-slate-300">Meta Title</label>
              <input
                id="metaTitle"
                type="text"
                value={formData.metaTitle}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="metaDesc" className="text-xs font-semibold text-slate-300">Meta Description</label>
              <textarea
                id="metaDesc"
                value={formData.metaDesc}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
