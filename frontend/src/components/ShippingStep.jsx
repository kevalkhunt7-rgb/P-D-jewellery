import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, User, Mail, Phone, Globe, Compass, ArrowRight, Loader2, ChevronDown, Search, Check } from 'lucide-react';
// 1. Import your dynamic country list asset
import countriesList from '../assets/country';

const FloatingInput = ({ icon, label, name, type = 'text', value, error, onChange, disabled, maxLength }) => (
  <div className="relative w-full">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-800 w-4 h-4 flex items-center justify-center pointer-events-none">
      {icon}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      maxLength={maxLength}
      placeholder={label}
      className={`w-full bg-white/50 border ${error ? 'border-red-400 focus:border-red-500' : 'border-stone-200 focus:border-[#B76E79]'} rounded-xl py-3.5 pl-11 pr-4 text-xs font-medium focus:outline-none transition-all disabled:opacity-50`}
    />
    {error && <p className="text-[10px] text-red-500 mt-1 pl-2 font-medium">{error}</p>}
  </div>
);

// Improved Premium Searchable Dropdown Design
const CustomSelect = ({ icon, label, name, value, options, error, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter countries according to search query
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-800 w-4 h-4 flex items-center justify-center pointer-events-none z-10">
        {icon}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/50 border text-left ${error ? 'border-red-400 focus:border-red-500' : isOpen ? 'border-[#B76E79] ring-1 ring-[#B76E79]/20' : 'border-stone-200'} rounded-xl py-3.5 pl-11 pr-10 text-xs font-medium focus:outline-none transition-all disabled:opacity-50 flex items-center justify-between text-stone-700`}
      >
        <span className={!selectedOption ? 'text-stone-800 font-normal' : 'text-stone-800'}>
          {selectedOption ? selectedOption.label : label}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-stone-800"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Dropdown Card */}
      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1.5 bg-white border border-stone-200 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col backdrop-blur-lg"
          >
            {/* Search Input Bar */}
            <div className="p-2 border-b border-stone-100 flex items-center gap-2 bg-stone-50/50">
              <Search className="w-3.5 h-3.5 text-stone-800 ml-2 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none py-1.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto py-1 flex-1 max-h-48 scrollbar-thin scrollbar-thumb-stone-200">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange({ target: { name, value: opt.value } });
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${value === opt.value
                        ? 'bg-[#B76E79]/10 text-[#B76E79] font-semibold'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                      }`}
                  >
                    <span>{opt.label}</span>
                    {value === opt.value && <Check className="w-3.5 h-3.5 text-[#B76E79]" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-4 text-center text-xs text-stone-800 font-bold">
                  No matching countries found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[10px] text-red-500 mt-1 pl-2 font-medium">{error}</p>}
    </div>
  );
};

export default function ShippingStep({
  user,
  formData,
  formErrors,
  handleInputChange,
  selectSavedAddress,
  handleProceedToPayment,
  fadeInScale
}) {
  const [isPostalLoading, setIsPostalLoading] = useState(false);

  // Auto-fetch City/State based on Country and ZIP/Postal code entry
  useEffect(() => {
    const fetchLocationData = async () => {
      const currentZip = formData.zip?.trim();
      const currentCountry = formData.country;

      if (!currentZip) return;

      // 1. India (6 digits)
      // ... inside fetchLocationData()

      // 1. India (6 digits)
      if (currentCountry === 'India' && currentZip.length === 6 && /^\d+$/.test(currentZip)) {
        setIsPostalLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${currentZip}`);
          const data = await res.json();
          if (data && data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const postOffice = data[0].PostOffice[0];
            handleInputChange({ target: { name: 'city', value: postOffice.District || '' } });
            handleInputChange({ target: { name: 'state', value: postOffice.State || '' } });
          }
        } catch (err) {
          console.error("Postal registry indexing failure (India):", err);
        } finally { // <--- Fixed typo here
          setIsPostalLoading(false);
        }
      }
      // 2. United States (5 digits)
      else if (currentCountry === 'United States' && currentZip.length === 5 && /^\d+$/.test(currentZip)) {
        setIsPostalLoading(true);
        try {
          const res = await fetch(`https://api.zippopotam.us/us/${currentZip}`);
          if (res.ok) {
            const data = await res.json();
            if (data.places && data.places.length > 0) {
              const place = data.places[0];
              handleInputChange({ target: { name: 'city', value: place['place name'] || '' } });
              handleInputChange({ target: { name: 'state', value: place['state'] || '' } });
            }
          }
        } catch (err) {
          console.error("Postal registry indexing failure (US):", err);
        } finally { // <--- Fixed typo here
          setIsPostalLoading(false);
        }
      }
      // 3. Germany, France, Spain, Italy (5 digits)
      else if (['Germany', 'France', 'Spain', 'Italy'].includes(currentCountry) && currentZip.length === 5 && /^\d+$/.test(currentZip)) {
        const isoMap = { 'Germany': 'de', 'France': 'fr', 'Spain': 'es', 'Italy': 'it' };
        const isoCode = isoMap[currentCountry];
        setIsPostalLoading(true);
        try {
          const res = await fetch(`https://api.zippopotam.us/${isoCode}/${currentZip}`);
          if (res.ok) {
            const data = await res.json();
            if (data.places && data.places.length > 0) {
              const place = data.places[0];
              handleInputChange({ target: { name: 'city', value: place['place name'] || '' } });
              handleInputChange({ target: { name: 'state', value: place['state'] || '' } });
            }
          }
        } catch (err) {
          console.error(`Postal registry indexing failure (${currentCountry}):`, err);
        } finally { // <--- Fixed typo here
          setIsPostalLoading(false);
        }
      }
      // 4. Canada (first 3 characters of A1A 1A1 format)
      else if (currentCountry === 'Canada') {
        const cleanZip = currentZip.replace(/\s+/g, '').substring(0, 3).toUpperCase();
        if (cleanZip.length === 3 && /^[A-Z]\d[A-Z]$/.test(cleanZip)) {
          setIsPostalLoading(true);
          try {
            const res = await fetch(`https://api.zippopotam.us/ca/${cleanZip}`);
            if (res.ok) {
              const data = await res.json();
              if (data.places && data.places.length > 0) {
                const place = data.places[0];
                handleInputChange({ target: { name: 'city', value: place['place name'] || '' } });
                handleInputChange({ target: { name: 'state', value: place['state'] || '' } });
              }
            }
          } catch (err) {
            console.error("Postal registry indexing failure (Canada):", err);
          } finally { // <--- Fixed typo here
            setIsPostalLoading(false);
          }
        }
      }
      // 5. United Kingdom (outward code segment e.g. SW1A, EC1A)
      else if (currentCountry === 'United Kingdom' && currentZip.length >= 3) {
        const parts = currentZip.trim().toUpperCase().split(/\s+/);
        const outward = parts[0];
        if (outward.length >= 2 && outward.length <= 4) {
          setIsPostalLoading(true);
          try {
            const res = await fetch(`https://api.zippopotam.us/gb/${outward}`);
            if (res.ok) {
              const data = await res.json();
              if (data.places && data.places.length > 0) {
                const place = data.places[0];
                handleInputChange({ target: { name: 'city', value: place['place name'] || '' } });
                handleInputChange({ target: { name: 'state', value: place['state'] || '' } });
              }
            }
          } catch (err) {
            console.error("Postal registry indexing failure (UK):", err);
          } finally { // <--- Fixed typo here
            setIsPostalLoading(false);
          }
        }
      }

      // ... rest of the file
    };

    fetchLocationData();
  }, [formData.zip, formData.country]);

  // Handle custom formatting rules for safe entry parameters
  const customChangeWrapper = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const sanitizedPhone = value.replace(/\D/g, '').slice(0, 10);
      handleInputChange({ target: { name, value: sanitizedPhone } });
      return;
    }

    if (name === 'zip') {
      let sanitizedZip = value;
      if (formData.country === 'India') {
        sanitizedZip = value.replace(/\D/g, '').slice(0, 6);
      } else if (formData.country === 'United States') {
        sanitizedZip = value.replace(/\D/g, '').slice(0, 5);
      } else if (['Germany', 'France', 'Spain', 'Italy'].includes(formData.country)) {
        sanitizedZip = value.replace(/\D/g, '').slice(0, 5);
      } else {
        sanitizedZip = value.replace(/[^a-zA-Z0-9\s-]/g, '').slice(0, 10);
      }
      handleInputChange({ target: { name, value: sanitizedZip } });
      return;
    }

    handleInputChange(e);
  };

  const handleCountryChange = (e) => {
    handleInputChange(e);
    handleInputChange({ target: { name: 'zip', value: '' } });
    handleInputChange({ target: { name: 'city', value: '' } });
    handleInputChange({ target: { name: 'state', value: '' } });
  };

  return (
    <motion.div
      key="shipping-step"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -30 }}
      variants={fadeInScale}
      className="bg-white/70 backdrop-blur-xl border border-stone-200/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-stone-200/40"
    >
      <h2 className="font-serif text-2xl tracking-wide text-stone-900 mb-1">Shipping Information</h2>
      <p className="text-stone-800 text-xs font-bold tracking-wide mb-8">Please detail the verified location for secure courier drop-off.</p>

      {user?.addresses?.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-stone-500 mb-3">Saved Destinations</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {user.addresses.map((addr) => (
              <button
                type="button"
                key={addr._id}
                onClick={() => selectSavedAddress(addr)}
                className="flex-shrink-0 w-48 p-3 rounded-xl border border-stone-200 bg-white hover:border-[#B76E79] transition-all text-left group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3 h-3 text-[#B76E79]" />
                  <span className="text-[10px] font-bold truncate">{addr.fullName}</span>
                </div>
                <p className="text-[9px] text-stone-500 line-clamp-2">{addr.addressLine}, {addr.city}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleProceedToPayment} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FloatingInput icon={<User />} label="Full Name" name="name" value={formData.name} error={formErrors.name} onChange={customChangeWrapper} />
          <FloatingInput icon={<Mail />} label="Email Address" name="email" type="email" value={formData.email} error={formErrors.email} onChange={customChangeWrapper} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FloatingInput icon={<Phone />} label="Phone Number" name="phone" type="tel" value={formData.phone} error={formErrors.phone} onChange={customChangeWrapper} maxLength={10} />

          {/* 3. Utilized the custom searchable dropdown */}
          <CustomSelect
            icon={<Globe />}
            label="Select Country"
            name="country"
            value={formData.country}
            options={countriesList}
            error={formErrors.country}
            onChange={handleCountryChange}
          />
        </div>

        <FloatingInput icon={<MapPin />} label="Street Address" name="address" value={formData.address} error={formErrors.address} onChange={customChangeWrapper} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <FloatingInput
              icon={isPostalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B76E79]" /> : <MapPin />}
              label="ZIP Code"
              name="zip"
              value={formData.zip}
              error={formErrors.zip}
              onChange={customChangeWrapper}
              maxLength={
                formData.country === 'India' ? 6 :
                  ['United States', 'Germany', 'France', 'Spain', 'Italy'].includes(formData.country) ? 5 : 10
              }
            />
          </div>

          <div>
            <FloatingInput icon={<Compass />} label="City" name="city" value={formData.city} error={formErrors.city} onChange={customChangeWrapper} disabled={isPostalLoading} />
          </div>

          <div>
            <FloatingInput icon={<Compass />} label="State" name="state" value={formData.state} error={formErrors.state} onChange={customChangeWrapper} disabled={isPostalLoading} />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="group px-10 py-4 bg-stone-900 text-[#FDF8F3] text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-stone-800 transition-all duration-300 flex items-center gap-3 shadow-lg"
          >
            <span>Proceed to Settlement</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}