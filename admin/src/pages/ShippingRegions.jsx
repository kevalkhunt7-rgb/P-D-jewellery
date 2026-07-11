import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiGlobe,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiPlusCircle,
  FiMinusCircle,
  FiChevronDown
} from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";
import { DeleteModal } from "../components/DeleteModal";

export function ShippingRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals & Form State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, regionId: null });
  const [formModal, setFormModal] = useState({ isOpen: false, type: "add", regionId: null });

  const [formData, setFormData] = useState({
    name: "",
    countries: [],
    currency: "USD",
    flatShippingCharge: 0,
    freeShippingThreshold: "",
    deliveryTime: "",
    status: "Active",
    isDefault: false,
    weightRules: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [countrySearch, setCountrySearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const countryDropdownRef = useRef(null);

  // Close country multi-select dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const fetchRegions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/shipping");
      if (data.success) {
        setRegions(data.regions || []);
      }
    } catch (error) {
      console.error("Failed to load regions:", error);
      toast.error(error.response?.data?.message || "Failed to load shipping regions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  // Map of countries already claimed by other regions (to block double-assignment)
  const claimedCountries = useMemo(() => {
    const map = {};
    regions.forEach((region) => {
      // Don't claim for the current region being edited
      if (formModal.isOpen && region._id === formModal.regionId) return;
      
      region.countries.forEach((code) => {
        map[code.toUpperCase()] = region.name;
      });
    });
    return map;
  }, [regions, formModal.isOpen, formModal.regionId]);

  // Form actions
  const openFormModal = (type, region = null) => {
    setFormErrors({});
    setCountrySearch("");
    setDropdownOpen(false);
    if (type === "edit" && region) {
      setFormData({
        name: region.name || "",
        countries: region.countries || [],
        currency: region.currency || "USD",
        flatShippingCharge: region.flatShippingCharge || 0,
        freeShippingThreshold: region.freeShippingThreshold !== null ? region.freeShippingThreshold : "",
        deliveryTime: region.deliveryTime || "",
        status: region.status || "Active",
        isDefault: !!region.isDefault,
        weightRules: region.weightRules || []
      });
      setFormModal({ isOpen: true, type: "edit", regionId: region._id });
    } else {
      setFormData({
        name: "",
        countries: [],
        currency: "USD",
        flatShippingCharge: 0,
        freeShippingThreshold: "",
        deliveryTime: "",
        status: "Active",
        isDefault: false,
        weightRules: []
      });
      setFormModal({ isOpen: true, type: "add", regionId: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };
      const isIndia = updated.name.toLowerCase() === "india" || updated.countries.includes("IN");
      updated.currency = isIndia ? "INR" : "USD";
      return updated;
    });
  };

  // Toggle country in multi-select list
  const toggleCountry = (code) => {
    const upper = code.toUpperCase();
    if (claimedCountries[upper]) return; // Block double-assignment

    setFormData((prev) => {
      const currentList = [...prev.countries];
      const idx = currentList.indexOf(upper);
      if (idx > -1) {
        currentList.splice(idx, 1);
      } else {
        currentList.push(upper);
      }
      const isIndia = prev.name.toLowerCase() === "india" || currentList.includes("IN");
      const currency = isIndia ? "INR" : "USD";
      return { ...prev, countries: currentList, currency };
    });
  };

  // Weight rules actions
  const addWeightRule = () => {
    setFormData((prev) => ({
      ...prev,
      weightRules: [...prev.weightRules, { minWeight: 0, maxWeight: 1000, charge: 10 }]
    }));
  };

  const removeWeightRule = (index) => {
    setFormData((prev) => ({
      ...prev,
      weightRules: prev.weightRules.filter((_, i) => i !== index)
    }));
  };

  const handleWeightRuleChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedRules = [...prev.weightRules];
      updatedRules[index] = {
        ...updatedRules[index],
        [field]: Number(value)
      };
      return { ...prev, weightRules: updatedRules };
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Region name is required.";
    if (!formData.currency.trim()) errors.currency = "Currency is required.";
    
    if (formData.flatShippingCharge === "" || Number(formData.flatShippingCharge) < 0) {
      errors.flatShippingCharge = "Charge must be non-negative.";
    }
    if (formData.freeShippingThreshold !== "" && Number(formData.freeShippingThreshold) < 0) {
      errors.freeShippingThreshold = "Threshold must be non-negative.";
    }
    if (!formData.deliveryTime.trim()) errors.deliveryTime = "Delivery time is required.";

    // Validate countries are selected (unless default rest-of-world rule)
    if (!formData.isDefault && formData.countries.length === 0) {
      errors.countries = "Select at least one country for this region.";
    }

    formData.weightRules.forEach((rule, idx) => {
      if (rule.minWeight < 0 || rule.maxWeight <= rule.minWeight || rule.charge < 0) {
        errors.weightRules = `Check boundaries at range ${idx + 1}.`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix form errors.");
      return;
    }

    const toastId = toast.loading("Saving region configuration...");
    try {
      const payload = {
        ...formData,
        flatShippingCharge: Number(formData.flatShippingCharge),
        freeShippingThreshold: formData.freeShippingThreshold !== "" ? Number(formData.freeShippingThreshold) : null
      };

      let res;
      if (formModal.type === "add") {
        res = await api.post("/shipping", payload);
      } else {
        res = await api.put(`/shipping/${formModal.regionId}`, payload);
      }

      if (res.data.success) {
        toast.success(res.data.message || "Saved successfully!", { id: toastId });
        setFormModal({ isOpen: false, type: "add", regionId: null });
        fetchRegions();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save region settings.", { id: toastId });
    }
  };

  const handleDeleteRegion = async () => {
    const toastId = toast.loading("Deleting region...");
    try {
      const { data } = await api.delete(`/shipping/${deleteModal.regionId}`);
      if (data.success) {
        toast.success("Region deleted successfully", { id: toastId });
        setDeleteModal({ isOpen: false, regionId: null });
        fetchRegions();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete region.", { id: toastId });
    }
  };

  // Toggle active status
  const toggleStatus = async (region) => {
    const nextStatus = region.status === "Active" ? "Inactive" : "Active";
    const toastId = toast.loading(`Updating status for ${region.name}...`);
    try {
      const { data } = await api.put(`/shipping/${region._id}`, { status: nextStatus });
      if (data.success) {
        toast.success(`${region.name} status is now ${nextStatus}`, { id: toastId });
        fetchRegions();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status.", { id: toastId });
    }
  };

  // Metrics
  const stats = useMemo(() => {
    const total = regions.length;
    const active = regions.filter(r => r.status === "Active").length;
    const defaultReg = regions.find(r => r.isDefault)?.name || "Rest of World";
    
    const uniqueCurrs = [...new Set(regions.map(r => r.currency))].length;
    let countriesCount = 0;
    regions.forEach(r => countriesCount += r.countries.length);

    return { total, active, defaultReg, uniqueCurrs, countriesCount };
  }, [regions]);

  // Filters logic
  const filteredRegions = useMemo(() => {
    return regions.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.currency.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      const matchesCurrency = currencyFilter === "all" || r.currency === currencyFilter;
      
      const matchesCountry = countryFilter === "all" || 
        r.countries.map(c => c.toUpperCase()).includes(countryFilter.toUpperCase());

      return matchesSearch && matchesStatus && matchesCurrency && matchesCountry;
    });
  }, [regions, searchTerm, statusFilter, currencyFilter, countryFilter]);

  const uniqueCurrenciesList = useMemo(() => {
    return [...new Set(regions.map(r => r.currency))];
  }, [regions]);

  // Pagination
  const totalPages = Math.ceil(filteredRegions.length / itemsPerPage);
  const currentTableData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegions.slice(start, start + itemsPerPage);
  }, [filteredRegions, currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, currencyFilter, countryFilter]);

  // Countries filtered by search in form
  const filteredFormCountries = useMemo(() => {
    return ALL_COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.code.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  if (loading && regions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-widest text-slate-400 uppercase animate-pulse">Loading Regions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200 p-1 select-none">
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, regionId: null })}
        onConfirm={handleDeleteRegion}
        title="Delete Shipping Region"
        message="Are you sure you want to delete this shipping region? Rest of World default region cannot be deleted."
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Shipping Regions
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure global shipping settings by grouping countries into regions
          </p>
        </div>
        <button
          onClick={() => openFormModal("add")}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider active:scale-[0.98] transition-all shadow-lg shadow-amber-500/10"
        >
          <FiPlus className="w-4 h-4" /> Create Region
        </button>
      </div>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Total Regions</p>
          <h3 className="text-2xl font-bold text-white mt-1">{stats.total}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Active Regions</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Covered Countries</p>
          <h3 className="text-2xl font-bold text-blue-400 mt-1">{stats.countriesCount}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Currencies</p>
          <h3 className="text-2xl font-bold text-purple-400 mt-1">{stats.uniqueCurrs}</h3>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Default Fallback</p>
          <h3 className="text-sm font-bold text-amber-500 mt-2.5 truncate">{stats.defaultReg}</h3>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by region name or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-white cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All</option>
                <option value="Active" className="bg-slate-900">Active</option>
                <option value="Inactive" className="bg-slate-900">Inactive</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Currency</span>
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value)}
                className="bg-transparent focus:outline-none font-bold text-white cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All</option>
                {uniqueCurrenciesList.map((c) => (
                  <option key={c} value={c} className="bg-slate-900">{c}</option>
                ))}
              </select>
            </div>

            {/* Country code filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300">
              <span className="text-[10px] uppercase tracking-wider text-slate-500">Country Code</span>
              <input
                type="text"
                placeholder="All (e.g. US)"
                value={countryFilter === "all" ? "" : countryFilter}
                onChange={(e) => setCountryFilter(e.target.value.trim().toUpperCase() || "all")}
                className="bg-transparent focus:outline-none font-bold text-white w-20 placeholder-slate-600 border-none uppercase"
              />
            </div>

            {(searchTerm || statusFilter !== "all" || currencyFilter !== "all" || countryFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCurrencyFilter("all");
                  setCountryFilter("all");
                }}
                className="text-xs font-bold uppercase text-amber-500 hover:text-amber-400 tracking-wider px-2"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* REGIONS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-950/30">
                <th className="px-6 py-4">Region Name</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Flat Rate</th>
                <th className="px-6 py-4">Free Threshold</th>
                <th className="px-6 py-4">Transit Time</th>
                <th className="px-6 py-4">Countries Count</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-300">
              {currentTableData.length > 0 ? (
                currentTableData.map((reg) => (
                  <tr key={reg._id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                      <FiGlobe className="text-slate-500" />
                      {reg.name}
                      {reg.isDefault && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider">
                          RoW Default
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{reg.currency}</td>
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {reg.currency} {reg.flatShippingCharge.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {reg.freeShippingThreshold !== null ? (
                        <span className="text-slate-300">
                          {reg.currency} {reg.freeShippingThreshold.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{reg.deliveryTime}</td>
                    <td className="px-6 py-4 font-bold">
                      {reg.isDefault ? "All others (Fallback)" : `${reg.countries.length} Countries`}
                    </td>
                    <td className="px-6 py-4">
                      {reg.weightRules && reg.weightRules.length > 0 ? (
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Weight ({reg.weightRules.length})
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider">
                          Flat Rate
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(reg)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                          reg.status === "Active"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                        }`}
                      >
                        {reg.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openFormModal("edit", reg)}
                          title="Edit Region"
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700/50"
                        >
                          <FiEdit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={reg.isDefault}
                          onClick={() => setDeleteModal({ isOpen: true, regionId: reg._id })}
                          title={reg.isDefault ? "Cannot delete default fallback region" : "Delete Region"}
                          className={`p-2 rounded-lg border transition-all ${
                            reg.isDefault 
                              ? "opacity-20 cursor-not-allowed bg-slate-800 border-slate-700 text-slate-500" 
                              : "bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-900 border-rose-500/20"
                          }`}
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-6 py-16 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">
                    No shipping regions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION PANEL */}
        {totalPages > 1 && (
          <div className="p-4 bg-slate-950/20 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>
              Showing Page {currentPage} of {totalPages} ({filteredRegions.length} regions)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-700"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {formModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm select-text overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {formModal.type === "add" ? "Create Shipping Region" : "Edit Shipping Region"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Configure regional boundaries and charges.</p>
              </div>
              <button
                onClick={() => setFormModal({ isOpen: false, type: "add", regionId: null })}
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Region Name */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Region Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. North America"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  {formErrors.name && <p className="text-[10px] text-rose-500 pl-1">{formErrors.name}</p>}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Currency</label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    disabled
                    placeholder="USD"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-400 uppercase font-bold cursor-not-allowed opacity-75"
                  />
                  {formErrors.currency && <p className="text-[10px] text-rose-500 pl-1">{formErrors.currency}</p>}
                </div>
              </div>

              {/* SEARCHABLE COUNTRY MULTI-SELECT SELECTOR */}
              {!formData.isDefault && (
                <div className="space-y-2 relative" ref={countryDropdownRef}>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Countries inside Region ({formData.countries.length} selected)
                  </label>
                  
                  {/* Select Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white text-left focus:outline-none focus:border-amber-500 flex items-center justify-between"
                  >
                    <span className="truncate max-w-[90%] text-slate-300">
                      {formData.countries.length > 0
                        ? formData.countries.join(", ")
                        : "Search & Select Countries..."}
                    </span>
                    <FiChevronDown className="text-slate-500" />
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl max-h-64 overflow-hidden flex flex-col">
                      <div className="p-2 border-b border-slate-800 bg-slate-900/40">
                        <input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      
                      <div className="overflow-y-auto py-1 divide-y divide-slate-900/50">
                        {filteredFormCountries.map((c) => {
                          const claimedBy = claimedCountries[c.code];
                          const isSelected = formData.countries.includes(c.code);
                          
                          return (
                            <button
                              key={c.code}
                              type="button"
                              disabled={!!claimedBy}
                              onClick={() => toggleCountry(c.code)}
                              className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                                claimedBy 
                                  ? "opacity-35 cursor-not-allowed bg-slate-900/20 text-slate-500" 
                                  : "text-slate-300 hover:bg-slate-800/50"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold">{c.name} ({c.code})</span>
                                {claimedBy && (
                                  <span className="text-[9px] text-amber-500/80 font-bold">
                                    Assigned to {claimedBy}
                                  </span>
                                )}
                              </div>
                              {isSelected && <FiCheck className="text-amber-500 w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {formErrors.countries && <p className="text-[10px] text-rose-500 pl-1">{formErrors.countries}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Flat shipping Charge */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Flat Shipping Charge</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">{formData.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      name="flatShippingCharge"
                      value={formData.flatShippingCharge}
                      onChange={handleInputChange}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                  {formErrors.flatShippingCharge && <p className="text-[10px] text-rose-500 pl-1">{formErrors.flatShippingCharge}</p>}
                </div>

                {/* Free shipping Threshold */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Free Shipping Threshold</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">{formData.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      name="freeShippingThreshold"
                      value={formData.freeShippingThreshold}
                      onChange={handleInputChange}
                      placeholder="Optional"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                    />
                  </div>
                  {formErrors.freeShippingThreshold && <p className="text-[10px] text-rose-500 pl-1">{formErrors.freeShippingThreshold}</p>}
                </div>

                {/* Transit delivery time */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Delivery Transit Time</label>
                  <input
                    type="text"
                    name="deliveryTime"
                    value={formData.deliveryTime}
                    onChange={handleInputChange}
                    placeholder="e.g. 5–7 Business Days"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  {formErrors.deliveryTime && <p className="text-[10px] text-rose-500 pl-1">{formErrors.deliveryTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Status Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Region Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-bold"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Default falling rule checkbox */}
                <div className="flex items-center gap-3 p-4 bg-slate-950/20 border border-slate-800 rounded-2xl h-[56px] self-end">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    disabled={formData.isDefault && formModal.type === "edit"}
                    className="w-4 h-4 rounded border-slate-800 text-amber-500 bg-slate-950 focus:ring-amber-500 focus:ring-opacity-25 cursor-pointer"
                  />
                  <div className="text-xs">
                    <label htmlFor="isDefault" className="font-bold text-white cursor-pointer select-none">
                      Rest of World Default Region
                    </label>
                  </div>
                </div>
              </div>

              {/* WEIGHT INTERVAL BUILDER */}
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Weight-wise Shipping Rules</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Specify rules by package weights</p>
                  </div>
                  <button
                    type="button"
                    onClick={addWeightRule}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-500 font-bold border border-slate-700 rounded-lg text-[10px] uppercase tracking-wider"
                  >
                    <FiPlus className="w-3.5 h-3.5" /> Add Range
                  </button>
                </div>

                {formErrors.weightRules && (
                  <p className="text-[10px] text-rose-500 font-semibold">{formErrors.weightRules}</p>
                )}

                {formData.weightRules.length > 0 ? (
                  <div className="space-y-3">
                    {formData.weightRules.map((rule, idx) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center bg-slate-950/20 border border-slate-800 p-3 rounded-xl relative">
                        {/* Min bounds */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Min Weight (g)</label>
                          <input
                            type="number"
                            value={rule.minWeight}
                            onChange={(e) => handleWeightRuleChange(idx, "minWeight", e.target.value)}
                            placeholder="0"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        {/* Max bounds */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Max Weight (g)</label>
                          <input
                            type="number"
                            value={rule.maxWeight}
                            onChange={(e) => handleWeightRuleChange(idx, "maxWeight", e.target.value)}
                            placeholder="500"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        {/* Cost */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Charge ({formData.currency})</label>
                          <input
                            type="number"
                            value={rule.charge}
                            onChange={(e) => handleWeightRuleChange(idx, "charge", e.target.value)}
                            placeholder="15"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>
                        {/* Delete row */}
                        <div className="flex justify-end pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => removeWeightRule(idx)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-900 rounded-lg border border-rose-500/20 active:scale-[0.98]"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    Flat shipping rate will be used. Weight thresholds are disabled.
                  </div>
                )}
              </div>

              {/* Footer save buttons */}
              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormModal({ isOpen: false, type: "add", regionId: null })}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Save Region
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

const ALL_COUNTRIES = [
  { name: "India", code: "IN" },
  { name: "United States", code: "US" },
  { name: "Canada", code: "CA" },
  { name: "Mexico", code: "MX" },
  { name: "United Kingdom", code: "GB" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Belgium", code: "BE" },
  { name: "Austria", code: "AT" },
  { name: "Portugal", code: "PT" },
  { name: "Sweden", code: "SE" },
  { name: "Denmark", code: "DK" },
  { name: "Finland", code: "FI" },
  { name: "Ireland", code: "IE" },
  { name: "Poland", code: "PL" },
  { name: "Czech Republic", code: "CZ" },
  { name: "Hungary", code: "HU" },
  { name: "Romania", code: "RO" },
  { name: "Greece", code: "GR" },
  { name: "Luxembourg", code: "LU" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "Qatar", code: "QA" },
  { name: "Kuwait", code: "KW" },
  { name: "Bahrain", code: "BH" },
  { name: "Oman", code: "OM" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Thailand", code: "TH" },
  { name: "Japan", code: "JP" },
  { name: "South Korea", code: "KR" },
  { name: "Indonesia", code: "ID" },
  { name: "Philippines", code: "PH" },
  { name: "Vietnam", code: "VN" },
  { name: "Australia", code: "AU" },
  { name: "New Zealand", code: "NZ" },
  { name: "Switzerland", code: "CH" },
  { name: "Hong Kong", code: "HK" },
  { name: "Taiwan", code: "TW" },
  { name: "South Africa", code: "ZA" },
  { name: "Brazil", code: "BR" },
  { name: "Argentina", code: "AR" },
  { name: "Turkey", code: "TR" }
];
