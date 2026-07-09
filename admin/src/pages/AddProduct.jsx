import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { FiArrowLeft, FiUpload, FiX, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { calculatePriceBreakdown } from "../utils/pricingCalculator";
import {
  buildLegacySpecificationPayload,
  createDefaultSpecifications,
  getSpecificationValue,
} from "../utils/productSpecifications";

const SPEC_FIELD_LABEL_MAP = {
  material: "Base Material",
  purity: "Purity",
  metalColor: "Metal Color",
  grossWeight: "Gross Weight",
  netWeight: "Net Weight",
  gender: "Gender",
  occasion: "Occasion",
  plating: "Plating Type",
  diamondWeight: "Diamond Carat",
  diamondPieces: "Number of Diamonds",
  diamondColor: "Diamond Color",
  bisHallmarkNumber: "BIS Hallmark Number",
  certificateDetails: "Certificate Details",
};

// GIA diamond color grades run alphabetically from D (colorless) to Z (light color).
const GIA_DIAMOND_COLOR_GRADES = Array.from({ length: 23 }, (_, i) =>
  String.fromCharCode(68 + i)
);

export function AddProduct() {
  const navigate = useNavigate();
  const [images, setImages] = useState([null, null, null, null, null]);
  const [previews, setPreviews] = useState([null, null, null, null, null]);
  const [goldRate24kt, setGoldRate24kt] = useState(8000);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    sku: "",
    discountPercentage: 0,
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
    gender: "unisex",
    specifications: createDefaultSpecifications(),
    // New premium jewellery fields
    metalType: "Gold",
    purity: "22KT",
    grossWeight: 0,
    netWeight: 0,
    metalColor: "Yellow Gold",
    diamondWeight: 0,
    diamondPieces: 0,
    diamondColor: "",
    bisHallmarkNumber: "",
    certificateDetails: "",
    makingChargeType: "per_gram",
    makingChargeValue: 0,
    gst: 3,
    cgstRate: 1.5,
    sgstRate: 1.5,
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
    const fetchGoldRate = async () => {
      try {
        const { data } = await api.get("/settings/gold-rate/public");
        if (data.success) {
          setGoldRate24kt(data.goldRate24kt);
        }
      } catch (error) {
        console.error("Failed to fetch gold rate", error);
      }
    };
    fetchCategories();
    fetchGoldRate();
  }, []);

  const syncSpecificationValue = (specifications, label, value) =>
    (() => {
      const targetLabel = String(label || "").toLowerCase();
      let updatedOnce = false;

      return specifications.map((item) => {
        const itemLabel = String(item?.label || "").toLowerCase();

        if (!updatedOnce && itemLabel && itemLabel === targetLabel) {
          updatedOnce = true;
          return { ...item, value: String(value ?? "") };
        }

        // Always clone to avoid any accidental shared-reference bugs
        return { ...item };
      });
    })();

  // Keep the default specs in sync with the premium jewellery fields on initial load.
  // (Without this, premium fields may have defaults like "22KT" but specs start empty.)
  useEffect(() => {
    setFormData((prev) => {
      const nextSpecifications = Object.entries(SPEC_FIELD_LABEL_MAP).reduce(
        (specs, [fieldId, label]) => syncSpecificationValue(specs, label, prev[fieldId]),
        prev.specifications
      );
      return { ...prev, specifications: nextSpecifications };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const nextFormData = {
        ...prev,
        [id]: nextValue,
      };
      const mappedLabel = SPEC_FIELD_LABEL_MAP[id];

      if (mappedLabel) {
        nextFormData.specifications = syncSpecificationValue(
          prev.specifications,
          mappedLabel,
          nextValue
        );
      }

      return nextFormData;
    });
  };

  const handleSpecificationChange = (specId, field, value) => {
    setFormData((prev) => {
      const nextSpecifications = prev.specifications.map((item) =>
        item?.id === specId ? { ...item, [field]: value } : { ...item }
      );

      if (field !== "value") {
        return {
          ...prev,
          specifications: nextSpecifications,
        };
      }

      const updatedItem = nextSpecifications.find((item) => item?.id === specId);
      const nextFormData = {
        ...prev,
        specifications: nextSpecifications,
      };
      const labelKey = updatedItem?.label?.toLowerCase();

      if (labelKey === "base material") nextFormData.material = value;
      if (labelKey === "purity") nextFormData.purity = value;
      if (labelKey === "metal color") nextFormData.metalColor = value;
      if (labelKey === "gross weight") nextFormData.grossWeight = value;
      if (labelKey === "net weight") nextFormData.netWeight = value;
      if (labelKey === "gender") nextFormData.gender = value;
      if (labelKey === "occasion") nextFormData.occasion = value;
      if (labelKey === "plating type") nextFormData.plating = value;
      if (labelKey === "diamond carat") nextFormData.diamondWeight = value;
      if (labelKey === "number of diamonds") nextFormData.diamondPieces = value;
      if (labelKey === "diamond color") nextFormData.diamondColor = value;
      if (labelKey === "bis hallmark number") nextFormData.bisHallmarkNumber = value;
      if (labelKey === "certificate details") nextFormData.certificateDetails = value;

      return nextFormData;
    });
  };

  const createSpecId = (label = "") =>
    (globalThis.crypto?.randomUUID?.() ||
      `spec_${Date.now()}_${Math.random().toString(16).slice(2)}`) +
    (label ? `_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}` : "");

  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { id: createSpecId(), label: "", value: "" },
      ],
    }));
  };

  const handleRemoveSpecification = (specId) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((item) => item?.id !== specId),
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
      const specificationPayload = buildLegacySpecificationPayload(formData.specifications);
      const payload = {
        ...formData,
        ...specificationPayload,
      };

      // Append basic fields dynamically
      Object.keys(payload).forEach(key => {
        // 🌟 FIX: Intercept complex structures so they don't turn into "[object Object]"
        if (key === 'gemstoneDetails' || key === "specifications" || Array.isArray(payload[key])) {
          data.append(key, JSON.stringify(payload[key]));
        } else if (payload[key] !== undefined && payload[key] !== null) {
          data.append(key, payload[key]);
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

  const pricePreview = useMemo(() => {
    const specPurity = getSpecificationValue(formData.specifications, "Purity");
    const specNetWeight = getSpecificationValue(formData.specifications, "Net Weight");

    try {
      return calculatePriceBreakdown({
        goldRate24kt,
        purity: specPurity || formData.purity || "22KT",
        netWeight: parseFloat(specNetWeight) || parseFloat(formData.netWeight) || 0,
        makingChargeType: formData.makingChargeType || "per_gram",
        makingChargeValue: parseFloat(formData.makingChargeValue) || 0,
        cgstRate: parseFloat(formData.cgstRate) || 1.5,
        sgstRate: parseFloat(formData.sgstRate) || 1.5,
        discountPercentage: parseFloat(formData.discountPercentage) || 0,
      });
    } catch (e) {
      return { originalPrice: 0, salePrice: 0, metalValue: 0, makingCharge: 0, cgst: 0, sgst: 0 };
    }
  }, [goldRate24kt, formData.specifications, formData.purity, formData.netWeight, formData.makingChargeType, formData.makingChargeValue, formData.cgstRate, formData.sgstRate, formData.discountPercentage]);

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

            <div className="grid gap-4 md:grid-cols-3">
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

              <div className="space-y-1.5">
                <label htmlFor="gender" className="text-xs font-semibold text-slate-300">Gender</label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unisex">Unisex</option>
                </select>
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

            {/* Live Pricing Preview Module */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850 space-y-3">
              <h3 className="text-xs font-bold text-white tracking-wider uppercase">Live Pricing Preview (Automatic)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[15px] font-bold text-slate-400 uppercase block">Original Price</span>
                  <span className="text-lg font-bold text-white">₹{pricePreview.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[15px] font-bold text-slate-400 uppercase block">Sale Price</span>
                  <span className="text-lg font-bold text-amber-500">₹{pricePreview.salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[15px] text-slate-500 border-t border-slate-900 pt-2.5">
                <div>Metal Value: <span className="text-slate-400 font-semibold">₹{pricePreview.metalValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div>Making Charges: <span className="text-slate-400 font-semibold">₹{pricePreview.makingCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div>CGST: <span className="text-slate-400 font-semibold">₹{pricePreview.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                <div>SGST: <span className="text-slate-400 font-semibold">₹{pricePreview.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              </div>
              <p className="text-[9px] text-slate-600">
                Calculated on-the-fly using 24KT Gold Rate: <strong>₹{goldRate24kt}/g</strong>.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="discountPercentage" className="text-xs font-semibold text-slate-300">Discount Percentage (%)</label>
                <input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

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
                    <option value="9KT">9KT Gold</option>
                    <option value="14KT">14KT Gold</option>
                    <option value="18KT">18KT Gold</option>
                    <option value="22KT">22KT Gold</option>
                    <option value="24KT">24KT Gold</option>
                    <option value="925 Sterling">925 Sterling Silver</option>
                    <option value="950 Platinum">950 Platinum</option>
                    <option value="999 Platinum">999 Platinum</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="metalColor" className="text-xs font-semibold text-slate-300">Metal Color</label>
                <div className="relative">
                  <select
                    id="metalColor"
                    value={formData.metalColor}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none pr-10"
                  >
                    <option value="Yellow Gold">Yellow Gold</option>
                    <option value="White Gold">White Gold</option>
                    <option value="Rose Gold">Rose Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Two-Tone">Two-Tone</option>
                  </select>
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
                    const checked = e.target.checked;
                    // Toggle the boolean, and optionally clear the values if unchecked
                    setFormData((prev) => {
                      const nextFormData = {
                        ...prev,
                        hasDiamonds: checked,
                        // Reset fields to default state if user unchecks it
                        diamondWeight: checked ? prev.diamondWeight : "0",
                        diamondPieces: checked ? prev.diamondPieces : "0",
                        diamondColor: checked ? prev.diamondColor : "",
                      };

                      nextFormData.specifications = syncSpecificationValue(
                        nextFormData.specifications,
                        SPEC_FIELD_LABEL_MAP.diamondWeight,
                        nextFormData.diamondWeight
                      );
                      nextFormData.specifications = syncSpecificationValue(
                        nextFormData.specifications,
                        SPEC_FIELD_LABEL_MAP.diamondPieces,
                        nextFormData.diamondPieces
                      );
                      nextFormData.specifications = syncSpecificationValue(
                        nextFormData.specifications,
                        SPEC_FIELD_LABEL_MAP.diamondColor,
                        nextFormData.diamondColor
                      );

                      return nextFormData;
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
                <div className="grid gap-4 md:grid-cols-3 animate-fadeIn">
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

                  {/* Diamond Color (GIA Grade) Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="diamondColor" className="text-xs font-semibold text-slate-300">
                      Diamond Color (GIA Grade)
                    </label>
                    <div className="relative">
                      <select
                        id="diamondColor"
                        value={formData.diamondColor}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none pr-10"
                      >
                        <option value="" disabled>Select GIA color grade</option>
                        {GIA_DIAMOND_COLOR_GRADES.map((grade) => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="makingChargeType" className="text-xs font-semibold text-slate-300">Making Charge Type</label>
                <select
                  id="makingChargeType"
                  value={formData.makingChargeType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="per_gram">Per Gram (₹/g)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="makingChargeValue" className="text-xs font-semibold text-slate-300">
                  {formData.makingChargeType === "per_gram" ? "Making Charges (₹/g)" : "Making Charges (%)"}
                </label>
                <input
                  id="makingChargeValue"
                  type="number"
                  step="0.01"
                  value={formData.makingChargeValue}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="cgstRate" className="text-xs font-semibold text-slate-300">CGST (%)</label>
                <input
                  id="cgstRate"
                  type="number"
                  step="0.1"
                  value={formData.cgstRate}
                  onChange={handleInputChange}
                  placeholder="1.5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sgstRate" className="text-xs font-semibold text-slate-300">SGST (%)</label>
                <input
                  id="sgstRate"
                  type="number"
                  step="0.1"
                  value={formData.sgstRate}
                  onChange={handleInputChange}
                  placeholder="1.5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
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
                    <option value="solid-gold">Solid Gold</option>
                    <option value="925-sterling-silver">925 Sterling Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="brass">Brass</option>
                    <option value="stainless-steel">Stainless Steel</option>
                    <option value="copper">Copper</option>
                    <option value="premium-alloy">Premium Jewellery Alloy</option>
                    <option value="titanium">Titanium</option>
                  </select>
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
                  <option value="" disabled>Select Metal Tone</option>
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
                        setFormData((prev) => {
                          const currentOccasions = prev.occasion
                            ? prev.occasion.split(',').map((o) => o.trim())
                            : [];

                          if (currentOccasions.includes(occ)) {
                            return prev;
                          }

                          const newOccasions = [...currentOccasions, occ].join(', ');

                          return {
                            ...prev,
                            occasion: newOccasions,
                            specifications: syncSpecificationValue(
                              prev.specifications,
                              "Occasion",
                              newOccasions
                            ),
                          };
                        });
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
          <div className="bg-[#0f172b] p-8 rounded-2xl">

            <hr className="border-gray-200" />
            <h2 className="text-2xl font-bold px-10 py-4 text-gray-200">
              Verify, Add, or Remove Details of This Product
            </h2>
            <hr className="border-gray-200 mb-5" />
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold tracking-wide text-white uppercase">Product Specifications</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Default fields are preloaded and can be edited, removed, or extended with custom specifications.</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpecification}
                  className="inline-flex items-center gap-2 bg-slate-950 border border-slate-800 hover:border-amber-500/40 hover:text-amber-400 text-slate-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Specification
                </button>
              </div>

              <div className="space-y-4">
                {formData.specifications.map((specification) => (
                  <div
                    key={specification.id}
                    className="group grid gap-4 items-end sm:grid-cols-[1fr_1fr_auto] p-3 rounded-2xl bg-slate-900/40 border border-slate-900/60 hover:border-slate-800/80 transition-all duration-200"
                  >
                    {/* Label Field */}
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-semibold text-slate-400 tracking-wide group-hover:text-slate-300 transition-colors">
                        Label
                      </label>
                      <input
                        type="text"
                        value={specification.label}
                        name={`spec_label_${specification.id}`}
                        autoComplete="off"
                        onChange={(e) => handleSpecificationChange(specification.id, "label", e.target.value)}
                        placeholder="e.g., Diamond Color"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                      />
                    </div>

                    {/* Value Field */}
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-semibold text-slate-400 tracking-wide group-hover:text-slate-300 transition-colors">
                        Value
                      </label>
                      <input
                        type="text"
                        value={specification.value}
                        name={`spec_value_${specification.id}`}
                        autoComplete="off"
                        onChange={(e) => handleSpecificationChange(specification.id, "value", e.target.value)}
                        placeholder="e.g., G Color"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all"
                      />
                    </div>

                    {/* Actions (Delete Button) */}
                    <div className="flex justify-end h-[46px] items-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecification(specification.id)}
                        className="h-10 w-10 inline-flex items-center justify-center bg-slate-950 border border-slate-800 hover:border-rose-500/40 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all duration-200 active:scale-95 shadow-sm"
                        aria-label={`Remove ${specification.label || "specification"}`}
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
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