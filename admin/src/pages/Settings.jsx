import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import {
  FiSettings, FiGlobe, FiShoppingBag, FiCreditCard,
  FiMail, FiBox, FiHome, FiShare2, FiLock, FiLoader,
  FiUsers, FiCheck, FiX, FiUserPlus, FiEdit, FiTrash2, FiUserCheck
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
// Default
import { SectionCard, InputField, ToggleSwitch, ImageUpload } from "../components/SettingsComponents"; // Named

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminRequests, setAdminRequests] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin"
  });
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const { admin } = useAuth();

  // State for all settings sections
  const [settings, setSettings] = useState({
    general: {},
    seo: {},
    order: {},
    payment: {},
    email: {},
    inventory: {},
    homepage: {},
    social: {},
    security: {}
  });

  // Local state for image previews
  const [previews, setPreviews] = useState({
    logo: null,
    favicon: null,
    ogImage: null,
    heroBanner: null
  });

  // Files state for uploads
  const [files, setFiles] = useState({});

  const [goldRate24kt, setGoldRate24kt] = useState(8000);
  const [dailySilverRate999, setDailySilverRate999] = useState(100);
  const [goldRateAuditLogs, setGoldRateAuditLogs] = useState([]);
  const [silverRateAuditLogs, setSilverRateAuditLogs] = useState([]);
  const [savingGoldRate, setSavingGoldRate] = useState(false);

  // ==========================================
  // Data Fetching Functions (Defined First)
  // ==========================================
  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/settings");
      if (data.success) {
        setSettings(data.settings);
        // Initialize previews from existing data
        setPreviews({
          logo: data.settings.general?.logo?.url,
          favicon: data.settings.general?.favicon?.url,
          ogImage: data.settings.seo?.ogImage?.url,
          heroBanner: data.settings.homepage?.heroBanner?.url
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminRequests = async () => {
    try {
      const { data } = await api.get("/admin/admin-requests");
      if (data.success) {
        setAdminRequests(data.requests);
      }
    } catch (error) {
      console.error("Fetch admin requests error:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data } = await api.get("/admin/admins");
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Fetch admins error:", error);
    }
  };

  const fetchGoldRateSettings = async () => {
    try {
      const { data } = await api.get("/settings/gold-rate");
      if (data.success) {
        setGoldRate24kt(data.goldRate24kt);
        setDailySilverRate999(data.dailySilverRate999 || 100);
        setGoldRateAuditLogs(data.auditLogs || []);
        setSilverRateAuditLogs(data.silverAuditLogs || []);
      }
    } catch (error) {
      console.error("Failed to fetch gold rate", error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAdminRequests();
    fetchGoldRateSettings();
    if (admin?.role === "superAdmin") {
      fetchAdmins();
    }
  }, [admin]);

  // ==========================================
  // Event & Form Handlers
  // ==========================================
  const handleReviewRequest = async (id, status) => {
    try {
      const { data } = await api.put(`/admin/admin-requests/${id}`, { status });
      if (data.success) {
        toast.success(`Request ${status}`);
        fetchAdminRequests();
      }
    } catch (error) {
      console.error("Review admin request error:", error);
      toast.error(error.response?.data?.message || "Failed to review request");
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/admin/admins", newAdmin);
      if (data.success) {
        toast.success("Admin created successfully!");
        setNewAdmin({ name: "", email: "", password: "", role: "admin" });
        setShowAddAdminModal(false);
        fetchAdmins();
      }
    } catch (error) {
      console.error("Add admin error:", error);
      toast.error(error.response?.data?.message || "Failed to create admin");
    }
  };

  const handleUpdateAdminRole = async (id, role) => {
    try {
      const { data } = await api.put(`/admin/admins/${id}/role`, { role });
      if (data.success) {
        toast.success("Role updated!");
        fetchAdmins();
      }
    } catch (error) {
      console.error("Update role error:", error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        const { data } = await api.delete(`/admin/admins/${id}`);
        if (data.success) {
          toast.success("Admin deleted!");
          fetchAdmins();
        }
      } catch (error) {
        console.error("Delete admin error:", error);
        toast.error(error.response?.data?.message || "Failed to delete admin");
      }
    }
  };

  const handleInputChange = (section, e) => {
    const { id, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [id]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleFileChange = (section, field, e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(prev => ({ ...prev, [field]: file }));
      setPreviews(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const saveSection = async (section) => {
    setSaving(true);
    const loadToast = toast.loading(`Saving ${section} settings...`);

    try {
      const formData = new FormData();
      // Add text/boolean fields
      Object.keys(settings[section]).forEach(key => {
        // Skip image objects, we handle files separately
        if (typeof settings[section][key] !== 'object' || settings[section][key] === null) {
          formData.append(key, settings[section][key]);
        }
      });

      // Add files if any for this section
      const sectionFiles = {
        general: ['logo', 'favicon'],
        seo: ['ogImage'],
        homepage: ['heroBanner']
      };

      if (sectionFiles[section]) {
        sectionFiles[section].forEach(fieldName => {
          if (files[fieldName]) {
            formData.append(fieldName, files[fieldName]);
          }
        });
      }

      const { data } = await api.put(`/settings/update/${section}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved`, { id: loadToast });
        setSettings(data.settings);
        // Clear files for this section after successful upload
        const newFiles = { ...files };
        if (sectionFiles[section]) {
          sectionFiles[section].forEach(f => delete newFiles[f]);
        }
        setFiles(newFiles);
      }
    } catch (error) {
      console.error(`Save ${section} error:`, error);
      toast.error(error.response?.data?.message || `Failed to save ${section} settings`, { id: loadToast });
    } finally {
      setSaving(false);
    }
  };

  const saveGoldRate = async () => {
    setSavingGoldRate(true);
    const loadToast = toast.loading("Saving metal rate settings...");
    try {
      const { data } = await api.put("/settings/gold-rate", {
        goldRate24kt: Number(goldRate24kt),
        dailySilverRate999: Number(dailySilverRate999),
      });
      if (data.success) {
        toast.success("Metal rates updated successfully", { id: loadToast });
        fetchGoldRateSettings();
      }
    } catch (error) {
      console.error("Save metal rates error:", error);
      toast.error(error.response?.data?.message || "Failed to save metal rates", { id: loadToast });
    } finally {
      setSavingGoldRate(false);
    }
  };

  const TABS = [
    { id: "general", label: "General", icon: <FiSettings /> },
    { id: "goldRate", label: "Metal Rates", icon: <FiSettings /> },
    { id: "seo", label: "SEO", icon: <FiGlobe /> },
    { id: "inventory", label: "Inventory", icon: <FiBox /> },
    { id: "social", label: "Social Media", icon: <FiShare2 /> },
    { id: "adminRequests", label: "Admin Requests", icon: <FiUsers /> },
    ...(admin?.role === "superAdmin" ? [{ id: "adminManagement", label: "Admin Management", icon: <FiUserCheck /> }] : []),
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <FiLoader className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse">Loading system settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Configure your global store preferences and integrations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${activeTab === tab.id
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 max-w-4xl">
          {/* Metal Rate Settings */}
          {activeTab === "goldRate" && (
            <SectionCard
              title="Global Metal Rate Settings"
              description="Update the global daily base rates per gram for Gold and Silver."
              onSave={saveGoldRate}
              loading={savingGoldRate}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="24KT Gold Rate (₹/g)" id="goldRate24kt" type="number"
                  value={goldRate24kt}
                  onChange={(e) => setGoldRate24kt(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 8000"
                />
                <InputField
                  label="999 Fine Silver Rate (₹/g)" id="dailySilverRate999" type="number"
                  step="0.01"
                  value={dailySilverRate999}
                  onChange={(e) => setDailySilverRate999(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 100"
                />
              </div>

              {/* Audit Logs Section */}
              <div className="grid md:grid-cols-2 gap-8 mt-8 border-t border-slate-800 pt-6">
                {/* Gold History */}
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 mb-4">Gold Rate Update History</h3>
                  {goldRateAuditLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No update logs recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Old Rate</th>
                            <th className="py-2.5">New Rate</th>
                            <th className="py-2.5">Updated By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {goldRateAuditLogs.map((log) => (
                            <tr key={log._id}>
                              <td className="py-2.5">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</td>
                              <td className="py-2.5">₹{log.oldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5">₹{log.newRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5">{log.updatedBy?.name || "System"} ({log.updatedBy?.email || "N/A"})</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Silver History */}
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-2 mb-4">Silver Rate Update History</h3>
                  {silverRateAuditLogs.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No update logs recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Old Rate</th>
                            <th className="py-2.5">New Rate</th>
                            <th className="py-2.5">Updated By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {silverRateAuditLogs.map((log) => (
                            <tr key={log._id}>
                              <td className="py-2.5">{new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}</td>
                              <td className="py-2.5">₹{log.oldRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5">₹{log.newRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5">{log.updatedBy?.name || "System"} ({log.updatedBy?.email || "N/A"})</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* General Settings */}
          {activeTab === "general" && (
            <SectionCard
              title="General Settings"
              description="Basic store identity and contact information"
              onSave={() => saveSection("general")}
              loading={saving}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Store Name" id="storeName"
                  value={settings.general.storeName}
                  onChange={(e) => handleInputChange("general", e)}
                  placeholder="e.g. P&D luxury Jewellery
"
                />
                <InputField
                  label="Store Email" id="storeEmail" type="email"
                  value={settings.general.storeEmail}
                  onChange={(e) => handleInputChange("general", e)}
                  placeholder="admin@yourstore.com"
                />
                <InputField
                  label="Phone Number" id="phone"
                  value={settings.general.phone}
                  onChange={(e) => handleInputChange("general", e)}
                  placeholder="+91 98765 43210"
                />

              </div>
              <InputField
                label="Store Address" id="address"
                value={settings.general.address}
                onChange={(e) => handleInputChange("general", e)}
                placeholder="Full physical address..."
              />
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <ImageUpload
                  label="Store Logo" id="logo"
                  preview={previews.logo}
                  onChange={(e) => handleFileChange("general", "logo", e)}
                  dimensions="Recommended: 512x512px (PNG)"
                />
                <ImageUpload
                  label="Favicon" id="favicon"
                  preview={previews.favicon}
                  onChange={(e) => handleFileChange("general", "favicon", e)}
                  dimensions="Recommended: 32x32px (ICO/PNG)"
                />
              </div>
            </SectionCard>
          )}

          {/* SEO Settings */}
          {activeTab === "seo" && (
            <SectionCard
              title="SEO & Marketing"
              description="Configure how your store appears in search engines"
              onSave={() => saveSection("seo")}
              loading={saving}
            >
              <InputField
                label="Meta Title" id="metaTitle"
                value={settings.seo.metaTitle}
                onChange={(e) => handleInputChange("seo", e)}
                placeholder="Page title for Google..."
              />
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Meta Description</label>
                <textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription || ''}
                  onChange={(e) => handleInputChange("seo", e)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white h-24 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <InputField
                label="Google Analytics ID" id="googleAnalyticsId"
                value={settings.seo.googleAnalyticsId}
                onChange={(e) => handleInputChange("seo", e)}
                placeholder="UA-XXXXX-X or G-XXXXXXX"
              />
              <ImageUpload
                label="Open Graph Image" id="ogImage"
                preview={previews.ogImage}
                onChange={(e) => handleFileChange("seo", "ogImage", e)}
                dimensions="Recommended: 1200x630px"
              />
            </SectionCard>
          )}

          

          {/* Inventory Settings */}
          {activeTab === "inventory" && (
            <SectionCard
              title="Inventory Management"
              description="Control how stock levels are handled"
              onSave={() => saveSection("inventory")}
              loading={saving}
            >
              <InputField
                label="Low Stock Alert Limit" id="lowStockLimit" type="number"
                value={settings.inventory?.lowStockLimit}
                onChange={(e) => handleInputChange("inventory", e)}
                helperText="Products with stock below this number will show alert"
              />
              <div className="space-y-4 pt-2">
                <ToggleSwitch
                  label="Inventory Tracking"
                  id="enableTracking"
                  checked={settings.inventory?.enableTracking}
                  onChange={(e) => handleInputChange("inventory", e)}
                  description="Automatically decrease stock on every order"
                />
                <ToggleSwitch
                  label="Auto Out of Stock"
                  id="autoOutOfStock"
                  checked={settings.inventory?.autoOutOfStock}
                  onChange={(e) => handleInputChange("inventory", e)}
                  description="Hide products from shop when stock reaches zero"
                />
              </div>
            </SectionCard>
          )}

          {/* Social Media */}
          {activeTab === "social" && (
            <SectionCard
              title="Social Media"
              description="Links for your footer and contact pages"
              onSave={() => saveSection("social")}
              loading={saving}
            >
              <div className="space-y-4">
                <InputField label="Instagram URL" id="instagram" value={settings.social.instagram} onChange={(e) => handleInputChange("social", e)} />
                <InputField label="Facebook URL" id="facebook" value={settings.social.facebook} onChange={(e) => handleInputChange("social", e)} />
                <InputField label="WhatsApp Number" id="whatsapp" value={settings.social.whatsapp} onChange={(e) => handleInputChange("social", e)} />
                <InputField label="YouTube URL" id="youtube" value={settings.social.youtube} onChange={(e) => handleInputChange("social", e)} />
                <InputField label="Twitter URL" id="twitter" value={settings.social.twitter} onChange={(e) => handleInputChange("social", e)} />
              </div>
            </SectionCard>
          )}

          {/* Admin Requests */}
          {activeTab === "adminRequests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Access Requests</h2>
                  <p className="text-xs text-slate-400 mt-1">Review and approve/reject admin requests</p>
                </div>
              </div>

              {adminRequests.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                  <FiUsers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminRequests.map((request) => (
                    <div key={request._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
                              <FiUsers className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">{request.name}</h3>
                              <p className="text-xs text-slate-500">{request.email}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${request.status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/30" :
                                request.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30" :
                                  "bg-red-500/10 text-red-500 border border-red-500/30"
                              }`}>
                              {request.status}
                            </span>
                            <p className="text-xs text-slate-500">
                              {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                          {request.reviewedBy && (
                            <p className="text-xs text-slate-500 mt-2">
                              Reviewed by: {request.reviewedBy.name} ({request.reviewedBy.email})
                            </p>
                          )}
                        </div>
                        {request.status === "pending" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReviewRequest(request._id, "approved")}
                              className="p-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                            >
                              <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReviewRequest(request._id, "rejected")}
                              className="p-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                            >
                              <FiX className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Admin Management */}
          {activeTab === "adminManagement" && admin?.role === "superAdmin" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Admin Management</h2>
                  <p className="text-xs text-slate-400 mt-1">Manage all admin users and their roles</p>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors flex items-center gap-2"
                >
                  <FiUserPlus /> Add Admin
                </button>
              </div>

              {admins.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
                  <FiUsers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No admin users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {admins.map((adminUser) => (
                    <div key={adminUser._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500 overflow-hidden">
                              {adminUser.avatar?.url ? (
                                <img src={adminUser.avatar.url} alt={adminUser.name} className="w-full h-full object-cover" />
                              ) : (
                                <img
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUser.name}`}
                                  alt={adminUser.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                {adminUser.name}
                                {adminUser._id === admin._id && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30">You</span>
                                )}
                              </h3>
                              <p className="text-xs text-slate-500">{adminUser.email}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${adminUser.role === "superAdmin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/30" :
                                "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              }`}>
                              {adminUser.role}
                            </span>
                            <p className="text-xs text-slate-500">
                              Joined {new Date(adminUser.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {adminUser._id !== admin._id && (
                          <div className="flex items-center gap-2">
                            <select
                              value={adminUser.role}
                              onChange={(e) => handleUpdateAdminRole(adminUser._id, e.target.value)}
                              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                            >
                              <option value="admin">Admin</option>
                              <option value="superAdmin">Super Admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteAdmin(adminUser._id)}
                              className="p-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Admin Modal */}
              {showAddAdminModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-white">Add New Admin</h3>
                      <button
                        onClick={() => setShowAddAdminModal(false)}
                        className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddAdmin} className="space-y-4">
                      <InputField
                        label="Name" id="name"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Admin Name"
                      />
                      <InputField
                        label="Email" id="email" type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="admin@example.com"
                      />
                      <InputField
                        label="Password" id="password" type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="At least 6 characters"
                      />
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
                        <select
                          value={newAdmin.role}
                          onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                        >
                          <option value="admin">Admin</option>
                          <option value="superAdmin">Super Admin</option>
                        </select>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddAdminModal(false)}
                          className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 px-4 py-2.5 bg-amber-500 text-slate-950 rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
                        >
                          Add Admin
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}