import React, { useState, useEffect } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";
import { 
  FiSettings, FiGlobe, FiShoppingBag, FiCreditCard, 
  FiMail, FiBox, FiHome, FiShare2, FiLock, FiLoader 
} from "react-icons/fi";
import { 
  SectionCard, InputField, ToggleSwitch, ImageUpload 
} from "../components/SettingsComponents";

export function Settings() {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
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

  useEffect(() => {
    fetchSettings();
  }, []);

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

  const handleInputChange = (section, e) => {
    const { id, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
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

  const TABS = [
    { id: "general", label: "General", icon: <FiSettings /> },
    { id: "seo", label: "SEO", icon: <FiGlobe /> },
    { id: "order", label: "Orders", icon: <FiShoppingBag /> },
    { id: "payment", label: "Payments", icon: <FiCreditCard /> },
    { id: "email", label: "Email", icon: <FiMail /> },
    { id: "inventory", label: "Inventory", icon: <FiBox /> },
    { id: "homepage", label: "Homepage", icon: <FiHome /> },
    { id: "social", label: "Social Media", icon: <FiShare2 /> },
    { id: "security", label: "Security", icon: <FiLock /> },
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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === tab.id
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
                  placeholder="e.g. Imit Jewelry"
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
                <InputField 
                  label="Currency Code" id="currency" 
                  value={settings.general.currency} 
                  onChange={(e) => handleInputChange("general", e)}
                  placeholder="INR"
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

          {/* Order Settings */}
          {activeTab === "order" && (
            <SectionCard 
              title="Order Preferences" 
              description="Manage shipping, taxes, and order behavior"
              onSave={() => saveSection("order")}
              loading={saving}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <InputField 
                  label="Shipping Charge" id="shippingCharge" type="number"
                  value={settings.order.shippingCharge} 
                  onChange={(e) => handleInputChange("order", e)}
                />
                <InputField 
                  label="Free Shipping Above" id="freeShippingMinAmount" type="number"
                  value={settings.order.freeShippingMinAmount} 
                  onChange={(e) => handleInputChange("order", e)}
                />
                <InputField 
                  label="Tax Percentage (%)" id="taxPercentage" type="number"
                  value={settings.order.taxPercentage} 
                  onChange={(e) => handleInputChange("order", e)}
                />
                <InputField 
                  label="Return Window (Days)" id="returnDays" type="number"
                  value={settings.order.returnDays} 
                  onChange={(e) => handleInputChange("order", e)}
                />
              </div>
              <div className="grid gap-4 pt-2">
                <ToggleSwitch 
                  label="Enable Cash on Delivery (COD)" 
                  id="enableCOD"
                  checked={settings.order.enableCOD}
                  onChange={(e) => handleInputChange("order", e)}
                  description="Allow customers to pay when they receive the product"
                />
                <ToggleSwitch 
                  label="Allow Order Cancellation" 
                  id="allowCancellation"
                  checked={settings.order.allowCancellation}
                  onChange={(e) => handleInputChange("order", e)}
                  description="Allow users to cancel orders from their dashboard"
                />
              </div>
            </SectionCard>
          )}

          {/* Payment Settings */}
          {activeTab === "payment" && (
            <SectionCard 
              title="Payment Gateways" 
              description="Configure your online payment integrations"
              onSave={() => saveSection("payment")}
              loading={saving}
            >
              <ToggleSwitch 
                label="Enable Online Payments" 
                id="enableOnlinePayment"
                checked={settings.payment.enableOnlinePayment}
                onChange={(e) => handleInputChange("payment", e)}
                description="Accept payments via Razorpay or Stripe"
              />
              <div className="space-y-6 pt-4">
                <div className="p-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-amber-500 flex items-center gap-2 uppercase tracking-widest">
                    <FiCreditCard /> Razorpay Integration
                  </p>
                  <InputField label="Key ID" id="razorpayKey" value={settings.payment.razorpayKey} onChange={(e) => handleInputChange("payment", e)} />
                  <InputField label="Key Secret" id="razorpaySecret" type="password" value={settings.payment.razorpaySecret} onChange={(e) => handleInputChange("payment", e)} />
                </div>
                <div className="p-5 bg-slate-950/40 border border-slate-800/60 rounded-2xl space-y-4">
                  <p className="text-xs font-bold text-blue-500 flex items-center gap-2 uppercase tracking-widest">
                    <FiCreditCard /> Stripe Integration
                  </p>
                  <InputField label="Publishable Key" id="stripePublicKey" value={settings.payment.stripePublicKey} onChange={(e) => handleInputChange("payment", e)} />
                  <InputField label="Secret Key" id="stripeSecretKey" type="password" value={settings.payment.stripeSecretKey} onChange={(e) => handleInputChange("payment", e)} />
                </div>
              </div>
            </SectionCard>
          )}

          {/* Email Settings */}
          {activeTab === "email" && (
            <SectionCard 
              title="Email Configuration" 
              description="Setup SMTP for transactional emails"
              onSave={() => saveSection("email")}
              loading={saving}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <InputField label="SMTP Host" id="smtpHost" value={settings.email.smtpHost} onChange={(e) => handleInputChange("email", e)} placeholder="smtp.gmail.com" />
                <InputField label="SMTP Port" id="smtpPort" value={settings.email.smtpPort} onChange={(e) => handleInputChange("email", e)} placeholder="587" />
                <InputField label="Sender Name" id="senderName" value={settings.email.senderName} onChange={(e) => handleInputChange("email", e)} />
                <InputField label="SMTP Email" id="smtpEmail" value={settings.email.smtpEmail} onChange={(e) => handleInputChange("email", e)} />
              </div>
              <InputField label="SMTP Password" id="smtpPassword" type="password" value={settings.email.smtpPassword} onChange={(e) => handleInputChange("email", e)} />
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
                value={settings.inventory.lowStockLimit} 
                onChange={(e) => handleInputChange("inventory", e)}
                helperText="Products with stock below this number will show alert"
              />
              <div className="space-y-4 pt-2">
                <ToggleSwitch 
                  label="Inventory Tracking" 
                  id="enableTracking"
                  checked={settings.inventory.enableTracking}
                  onChange={(e) => handleInputChange("inventory", e)}
                  description="Automatically decrease stock on every order"
                />
                <ToggleSwitch 
                  label="Auto Out of Stock" 
                  id="autoOutOfStock"
                  checked={settings.inventory.autoOutOfStock}
                  onChange={(e) => handleInputChange("inventory", e)}
                  description="Hide products from shop when stock reaches zero"
                />
              </div>
            </SectionCard>
          )}

          {/* Homepage Settings */}
          {activeTab === "homepage" && (
            <SectionCard 
              title="Homepage Layout" 
              description="Customize counts and banners on your storefront"
              onSave={() => saveSection("homepage")}
              loading={saving}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <InputField label="Featured Count" id="featuredProductCount" type="number" value={settings.homepage.featuredProductCount} onChange={(e) => handleInputChange("homepage", e)} />
                <InputField label="Trending Count" id="trendingProductCount" type="number" value={settings.homepage.trendingProductCount} onChange={(e) => handleInputChange("homepage", e)} />
                <InputField label="New Arrival Count" id="newArrivalCount" type="number" value={settings.homepage.newArrivalCount} onChange={(e) => handleInputChange("homepage", e)} />
              </div>
              <ImageUpload 
                label="Hero Banner Image" id="heroBanner" 
                preview={previews.heroBanner}
                onChange={(e) => handleFileChange("homepage", "heroBanner", e)}
                dimensions="Recommended: 1920x600px"
              />
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

          {/* Security */}
          {activeTab === "security" && (
            <SectionCard 
              title="Security & Auth" 
              description="Protect your administrative access"
              onSave={() => saveSection("security")}
              loading={saving}
            >
              <InputField label="Session Timeout (Minutes)" id="sessionTimeout" type="number" value={settings.security.sessionTimeout} onChange={(e) => handleInputChange("security", e)} />
              <ToggleSwitch 
                label="Two-Factor Authentication" 
                id="twoFactorAuth"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => handleInputChange("security", e)}
                description="Require extra verification code during login"
              />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}
