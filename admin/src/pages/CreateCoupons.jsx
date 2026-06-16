import { useState } from "react";
import { useNavigate } from "react-router";
import { FiArrowLeft, FiPercent, FiDollarSign } from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";

export function CreateCoupon() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountValue: "",
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    usageLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    startTime: "00:00",
    endTime: "23:59",
    applyTo: "all",
    status: "active",
    customerType: "all"
  });

  // Custom states for switches
  const [autoApply, setAutoApply] = useState(false);
  const [showOnWebsite, setShowOnWebsite] = useState(false);
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountValue || !formData.endDate) {
      return toast.error("Please fill in all required fields");
    }

    const loadToast = toast.loading("Creating coupon...");
    setLoading(true);

    try {
      // Combine date and time for expiryDate
      const expiryDate = new Date(`${formData.endDate}T${formData.endTime}`);

      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discountType: discountType,
        discountValue: Number(formData.discountValue),
        minimumOrderAmount: Number(formData.minimumOrderAmount),
        maximumDiscountAmount: Number(formData.maximumDiscountAmount),
        usageLimit: Number(formData.usageLimit),
        expiryDate: expiryDate,
        isActive: formData.status === "active",
        // These fields are expected by backend but not fully implemented in UI yet
        applicableCategories: [],
        applicableProducts: []
      };

      const { data } = await api.post("/coupons/create", payload);

      if (data.success) {
        toast.success("Coupon created successfully", { id: loadToast });
        navigate("/coupons");
      }
    } catch (error) {
      console.error("Create coupon error:", error);
      toast.error(error.response?.data?.message || "Failed to create coupon", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl text-slate-200 p-1">
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Coupon</h1>
          <p className="text-xs text-slate-400 mt-0.5">Configure a new promotional discount profile</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Basic Information Block */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Basic Information</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="code" className="text-xs font-semibold text-slate-300">
                  Coupon Code <span className="text-amber-500">*</span>
                </label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER25"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 font-mono uppercase text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Use uppercase letters and numbers only strings
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Internal evaluation metadata description for this token rule..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          {/* Discount Settings Config Matrix */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Discount Settings</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Discount Type <span className="text-amber-500">*</span>
                </label>
                
                {/* Custom Radio Group Implementation */}
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer group max-w-fit">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="discountType"
                        value="percentage"
                        checked={discountType === "percentage"}
                        onChange={() => setDiscountType("percentage")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        discountType === "percentage" ? "border-amber-500 bg-amber-500/10" : "border-slate-800 bg-slate-950"
                      }`}>
                        {discountType === "percentage" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-xs text-slate-300 group-hover:text-white transition-colors">
                      <FiPercent className="w-3.5 h-3.5 text-slate-500" />
                      Percentage Discount
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group max-w-fit">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="radio"
                        name="discountType"
                        value="fixed"
                        checked={discountType === "fixed"}
                        onChange={() => setDiscountType("fixed")}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        discountType === "fixed" ? "border-amber-500 bg-amber-500/10" : "border-slate-800 bg-slate-950"
                      }`}>
                        {discountType === "fixed" && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </div>
                    </div>
                    <span className="flex items-center gap-2 text-xs text-slate-300 group-hover:text-white transition-colors">
                      <FiDollarSign className="w-3.5 h-3.5 text-slate-500" />
                      Fixed Amount Discount
                    </span>
                  </label>
                </div>
              </div>

              {/* Dynamic Value Input Variant */}
              <div className="space-y-1.5">
                <label htmlFor="discountValue" className="text-xs font-semibold text-slate-300">
                  {discountType === "percentage" ? "Discount Percentage" : "Discount Amount"} <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  {discountType === "percentage" ? (
                    <>
                      <input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        placeholder="25"
                        min="0"
                        max="100"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-8 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                        %
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                        ₹
                      </span>
                      <input
                        id="discountValue"
                        type="number"
                        value={formData.discountValue}
                        onChange={handleInputChange}
                        placeholder="500"
                        min="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="minimumOrderAmount" className="text-xs font-semibold text-slate-300">Minimum Purchase Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="minimumOrderAmount"
                      type="number"
                      value={formData.minimumOrderAmount}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="maximumDiscountAmount" className="text-xs font-semibold text-slate-300">Maximum Discount Amount</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 pointer-events-none">
                      ₹
                    </span>
                    <input
                      id="maximumDiscountAmount"
                      type="number"
                      value={formData.maximumDiscountAmount}
                      onChange={handleInputChange}
                      placeholder="No limit"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Usage Thresholds limits */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Usage Limits</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="usageLimit" className="text-xs font-semibold text-slate-300">Maximum Total Uses</label>
                <input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="Unlimited"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="user-uses" className="text-xs font-semibold text-slate-300">Uses Per Customer</label>
                <input
                  id="user-uses"
                  type="number"
                  placeholder="1"
                  defaultValue="1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Temporal Boundaries */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Validity Period</h2>
            
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="startDate" className="text-xs font-semibold text-slate-300">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="endDate" className="text-xs font-semibold text-slate-300">
                    End Date <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="startTime" className="text-xs font-semibold text-slate-300">Start Time</label>
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="endTime" className="text-xs font-semibold text-slate-300">End Time</label>
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Allocation Scope */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Applicable Products/Categories</h2>
            
            <div className="space-y-1.5">
              <label htmlFor="applyTo" className="text-xs font-semibold text-slate-300">Apply To</label>
              <select
                id="applyTo"
                value={formData.applyTo}
                onChange={handleInputChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
              >
                <option value="all">All Products</option>
                <option value="categories">Specific Categories</option>
                <option value="products">Specific Products</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sidebar Constraints Panels */}
        <div className="space-y-6">
          
          {/* Component Operational Status */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Status</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="status" className="text-xs font-semibold text-slate-300">Coupon Status</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Semantic Check Switch Control (Auto Apply) */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 max-w-[75%]">
                  <p className="text-xs font-bold text-slate-300">Auto Apply</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Automatically evaluate and assign tracking lines at checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApply(!autoApply)}
                  className={`w-10 h-5 rounded-full relative transition-colors border focus:outline-none ${
                    autoApply ? "bg-amber-500 border-amber-400" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full shadow-md transition-transform transform ${
                      autoApply ? "translate-x-5 bg-slate-950" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Semantic Check Switch Control (Show on Website) */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 max-w-[75%]">
                  <p className="text-xs font-bold text-slate-300">Show on Website</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Display inside interactive user dashboard spaces
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnWebsite(!showOnWebsite)}
                  className={`w-10 h-5 rounded-full relative transition-colors border focus:outline-none ${
                    showOnWebsite ? "bg-amber-500 border-amber-400" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full shadow-md transition-transform transform ${
                      showOnWebsite ? "translate-x-5 bg-slate-950" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Demographic Matrix */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2">Customer Eligibility</h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="customerType" className="text-xs font-semibold text-slate-300">Customer Type</label>
                <select
                  id="customerType"
                  value={formData.customerType}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                >
                  <option value="all">All Customers</option>
                  <option value="new">New Customers</option>
                  <option value="existing">Existing Customers</option>
                  <option value="vip">VIP Customers</option>
                </select>
              </div>

              {/* Semantic Check Switch Control (First Order Only) */}
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5 max-w-[75%]">
                  <p className="text-xs font-bold text-slate-300">First Order Only</p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Valid for first purchase checkpoint intercept only
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFirstOrderOnly(!firstOrderOnly)}
                  className={`w-10 h-5 rounded-full relative transition-colors border focus:outline-none ${
                    firstOrderOnly ? "bg-amber-500 border-amber-400" : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 bg-white w-3.5 h-3.5 rounded-full shadow-md transition-transform transform ${
                      firstOrderOnly ? "translate-x-5 bg-slate-950" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Core Controls Persistence Blocks */}
          <div className="space-y-2.5 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-2.5 px-4 rounded-xl transition-colors shadow-lg shadow-amber-500/5 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Coupon"}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </form>
  );
}