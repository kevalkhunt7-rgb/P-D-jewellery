import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../utils/api";
import { FiArrowLeft, FiUpload, FiX, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";

export function AddProduct() {
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
    gemstoneDetails: [],
    status: "active",
    isTrending: false,
    isNewArrival: false,
    isFeatured: false,
    metaTitle: "",
    metaDesc: "",
    tags: "",
    defaultRating: 0,
    // New premium jewellery fields
    metalType: "Gold",
    purity: "22KT",
    grossWeight: 0,
    netWeight: 0,
    metalColor: "Yellow Gold",
    diamondWeight: 0,
    diamondPieces: 0,
    bisHallmarkNumber: "",
    certificateDetails: "",
    makingCharges: 0,
    gst: 3,
    warranty: "Lifetime",
    buybackEligibility: true
  });
  const [variants, setVariants] = useState([{ color: "", size: "", stock: 0 }]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/categories/get-categories");
        if (data.success) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleAddProduct = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const data = new FormData();

    // Append basic fields dynamically
    Object.keys(formData).forEach(key => {
      // 🌟 FIX: Intercept complex structures so they don't turn into "[object Object]"
      if (key === 'gemstoneDetails' || Array.isArray(formData[key])) {
        data.append(key, JSON.stringify(formData[key]));
      } else if (formData[key] !== undefined && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    // Append images
    images.forEach(img => {
      if (img) {
        data.append('images', img);
      }
    });

    // Append variants as JSON string
    data.append('variants', JSON.stringify(variants));

    const response = await api.post("/products/add-product", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.data.success) {
      toast.success("Product added successfully!");
      navigate("/products");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    toast.error(error.response?.data?.message || "Failed to add product");
  } finally {
    setLoading(false);
  }
};
  const handleAddVariant = () => {
    setVariants([...variants, { color: "", size: "", stock: 0 }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-5xl text-slate-200 p-1">
      {/* Page Header Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Add New Product</h1>
          <p className="text-xs text-slate-400 mt-0.5">Create a new jewelry item listing</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form Fields Layout */}
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Information Section Container */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Basic Information</h2>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-300">Product Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Rose Gold Necklace Set"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your product..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-xs font-semibold text-slate-300">Category *</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="" disabled>Select category</option>
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
                  placeholder="JWL-NCK-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Product Images Media Container */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Product Images (Max 5)</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[0, 1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative aspect-square">
                    {previews[index] ? (
                      <div className="relative group w-full h-full rounded-xl overflow-hidden border border-slate-800">
                        <img
                          src={previews[index]}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <FiX className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full aspect-square rounded-xl border-2 border-dashed border-slate-800 hover:border-amber-500/50 bg-slate-950 transition-colors cursor-pointer text-slate-500 hover:text-amber-500">
                        <FiUpload className="w-5 h-5" />
                        <span className="text-[10px] font-medium mt-1">Slot {index + 1}</span>
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
              <p className="text-[11px] text-slate-500">
                The first image will be used as the main product thumbnail.
              </p>
            </div>
          </div>

          {/* Pricing & Inventory Configuration Box */}
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
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
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
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
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
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="weight" className="text-xs font-semibold text-slate-300">Weight (grams)</label>
                <input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
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
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Premium Jewellery Meta Specs Information */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Premium Jewellery Details</h2>

            <div className="grid gap-4 md:grid-cols-2">


              <div className="space-y-1.5">
                <label htmlFor="purity" className="text-xs font-semibold text-slate-300">Purity</label>
                <div className="relative">
                  <select
                    id="purity"
                    value={formData.purity}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none pr-10"
                  >
                    <option value="" disabled>Select purity</option>
                    <option value="14KT">14KT Gold</option>
                    <option value="18KT">18KT Gold</option>
                    <option value="22KT">22KT Gold</option>
                    <option value="24KT">24KT Gold</option>
                    <option value="925 Sterling">925 Sterling Silver</option>

                    {/* 🔴 FIX: Changed value from "950-platinum" to "950 Platinum" */}
                    <option value="950 Platinum">950 Platinum</option>
                    <option value="999 Platinum">999 Platinum</option>
                  </select>

                  {/* Chevron icon */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
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
                  placeholder="0"
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
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">


              <div className="space-y-1.5">
                <label htmlFor="bisHallmarkNumber" className="text-xs font-semibold text-slate-300">BIS Hallmark Number</label>
                <input
                  id="bisHallmarkNumber"
                  type="text"
                  value={formData.bisHallmarkNumber}
                  onChange={handleInputChange}
                  placeholder="Enter BIS Hallmark number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-4">
              {/* 1. The Diamond Toggle Checkbox */}
              <div className="flex items-center gap-3 bg-slate-900/30 border border-slate-800/60 p-3 rounded-xl">
                <input
                  id="hasDiamonds"
                  type="checkbox"
                  checked={formData.hasDiamonds || false}
                  onChange={(e) => {
                    // Toggle the boolean, and optionally clear the values if unchecked
                    setFormData({
                      ...formData,
                      hasDiamonds: e.target.checked,
                      // Reset fields to default state if user unchecks it
                      diamondWeight: e.target.checked ? formData.diamondWeight : "0",
                      diamondPieces: e.target.checked ? formData.diamondPieces : "0",
                    });
                  }}
                  className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500/30 focus:ring-offset-slate-950 accent-amber-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <label htmlFor="hasDiamonds" className="text-sm font-medium text-slate-200 cursor-pointer select-none">
                    Contains Diamonds / Precious Accents
                  </label>
                  <span className="text-[11px] text-slate-500">Enable this to specify carat weights and piece counts.</span>
                </div>
              </div>

              {/* 2. Conditional Grid Sections */}
              {formData.hasDiamonds && (
                <div className="grid gap-4 md:grid-cols-2 animate-fadeIn">
                  {/* Diamond Weight Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="diamondWeight" className="text-xs font-semibold text-slate-300">
                      Total Diamond Weight (Carats)
                    </label>
                    <input
                      id="diamondWeight"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.diamondWeight}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  {/* Number of Diamonds Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="diamondPieces" className="text-xs font-semibold text-slate-300">
                      Number of Diamonds (Stone Count)
                    </label>
                    <input
                      id="diamondPieces"
                      type="number"
                      min="0"
                      value={formData.diamondPieces}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="makingCharges" className="text-xs font-semibold text-slate-300">Making Charges (₹)</label>
                <input
                  id="makingCharges"
                  type="number"
                  value={formData.makingCharges}
                  onChange={handleInputChange}
                  placeholder="0"
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
                  placeholder="3"
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
                placeholder="Enter certificate details (IGI, GIA, etc.)"
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">



            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="material" className="text-xs font-semibold text-slate-300">
                  Base Material
                </label>

                <div className="relative">
                  <select
                    id="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none pr-10"
                  >
                    <option value="" disabled>Select base material</option>

                    {/* Precious Base Metals */}
                    <option value="solid-gold">Solid Gold</option>
                    <option value="925-sterling-silver">925 Sterling Silver</option>
                    <option value="platinum">Platinum</option>

                    {/* Semi-Precious & Fashion Base Metals */}
                    <option value="brass">Brass</option>
                    <option value="stainless-steel">Stainless Steel</option>
                    <option value="copper">Copper</option>
                    <option value="premium-alloy">Premium Jewellery Alloy</option>
                    <option value="titanium">Titanium</option>
                  </select>

                  {/* Custom Dropdown Chevron Arrow UI */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="plating" className="text-xs font-semibold text-slate-300">
                  Plating Type
                </label>

                {/* Relative container to absolute-position our custom dropdown arrow */}
                <div className="relative">
                  <select
                    id="plating"
                    value={formData.plating}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none pr-10"
                  >
                    <option value="" disabled>Select plating / finish</option>

                    {/* Standard Premium Finishes */}
                    <option value="18k-gold-plated">18K Gold Plated</option>
                    <option value="14k-gold-plated">14K Gold Plated</option>
                    <option value="rose-gold-plated">Rose Gold Plated</option>

                    {/* High-End Plating Tier */}
                    <option value="gold-vermeil">Gold Vermeil (Heavy Gold over Silver)</option>
                    <option value="rhodium-plated">Rhodium Plated (Anti-Tarnish White Finish)</option>

                    {/* No Plating (Solid metals or raw metals) */}
                    <option value="none">None (Solid Metal / Unplated)</option>
                  </select>

                  {/* Custom Dropdown Chevron Arrow UI (Because appearance-none hides the native one) */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="color" className="text-xs font-semibold text-slate-300">Color</label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="" disabled selected>Select Metal Tone</option>
                  <option value="yellow-gold">Yellow Gold</option>
                  <option value="white-gold">White Gold</option>
                  <option value="rose-gold">Rose Gold</option>
                  <option value="two-tone">Two-Tone</option>
                  <option value="platinum">Platinum</option>
                  <option value="sterling-silver">Sterling Silver</option>
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
                  {["Wedding", "Party", "Casual", "Festive", "Daily Wear", "Engagement"].map((occ, idx) => (
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
              <label className="text-xs font-semibold text-slate-300">Stone / Gems</label>

              {/* 1. Selected Gems Display (Pills/Tags) */}
              {formData.gemstoneDetails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-slate-900/50 border border-slate-800/80 rounded-xl mb-2">
                  {/* Added optional chaining '?.' to prevent crashes if the array is missing at runtime */}
                  {formData.gemstoneDetails?.map((stone, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-2.5 py-1 rounded-lg font-medium"
                    >
                      {/* 🌟 FIX 1: Render stone.name because 'stone' is an object, not a string */}
                      {stone.name}

                      <button
                        type="button"
                        onClick={() => {
                          // 🌟 FIX 2: Filter from gemstoneDetails instead of stones
                          const updatedGems = formData.gemstoneDetails.filter((_, i) => i !== index);

                          // 🌟 FIX 3: Update the correct gemstoneDetails state key
                          setFormData({ ...formData, gemstoneDetails: updatedGems });
                        }}
                        className="hover:text-amber-200 font-bold transition-colors ml-0.5"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 2. Selection & Manual Entry Input */}
              <div className="relative">
                <input
                  id="stones-input"
                  type="text"
                  list="gemstone-options"
                  placeholder={formData.gemstoneDetails.length > 0 ? "Add another stone..." : "Select or type e.g., Diamond, Ruby..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  onChange={(e) => {
                    const val = e.target.value.trim();

                    // Check if the typed/selected value matches any item in our datalist options
                    const options = document.getElementById('gemstone-options').options;
                    const matchesOption = Array.from(options).some(opt => opt.value.toLowerCase() === val.toLowerCase());

                    // If it matches a dropdown option, add it instantly as an object
                    if (matchesOption) {
                      const alreadyExists = formData.gemstoneDetails.some(
                        (item) => item.name.toLowerCase() === val.toLowerCase()
                      );

                      if (!alreadyExists) {
                        setFormData({
                          ...formData,
                          gemstoneDetails: [...formData.gemstoneDetails, { name: val }]
                        });
                      }
                      e.target.value = ''; // Clear input for the next stone
                    }
                  }}
                  onKeyDown={(e) => {
                    // Allows manual typing: Pressing 'Enter' or ',' saves custom entries
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const val = e.target.value.replace(/,/g, '').trim();

                      if (val) {
                        const alreadyExists = formData.gemstoneDetails.some(
                          (item) => item.name.toLowerCase() === val.toLowerCase()
                        );

                        if (!alreadyExists) {
                          setFormData({
                            ...formData,
                            gemstoneDetails: [...formData.gemstoneDetails, { name: val }]
                          });
                        }
                      }
                      e.target.value = ''; // Clear input
                    }
                  }}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Press <kbd className="bg-slate-900 px-1 rounded text-slate-400">Enter</kbd> or <kbd className="bg-slate-900 px-1 rounded text-slate-400">,</kbd> to add custom gemstones manually.
                </p>

                {/* The Dropdown Options */}
                <datalist id="gemstone-options">
                  <option value="Diamond" />
                  <option value="Ruby" />
                  <option value="Emerald" />
                  <option value="Blue Sapphire" />
                  <option value="Pink Sapphire" />
                  <option value="Yellow Sapphire" />
                  <option value="Pearl" />
                  <option value="Tanzanite" />
                  <option value="Aquamarine" />
                  <option value="Morganite" />
                  <option value="Opal" />
                  <option value="Amethyst" />
                  <option value="Topaz" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Complex Functional Dynamic Custom Variant Matrix */}

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
          {/* Action Sidebar Controls Container */}
          <div className="space-y-6">

            {/* Publish Controls Block */}
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Publish</h2>

              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-semibold text-slate-300">Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={loading}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-colors shadow-lg shadow-amber-500/10"
                >
                  {loading ? "Adding..." : "Add Product"}
                </button>
                <button
                  type="button"
                  className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs py-2.5 rounded-xl transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </div>

            {/* Product Tag Matrix Accent */}

          </div>

          {/* Optimization SEO Metadata Settings */}

        </div>


      </div>
    </div>
  );
}