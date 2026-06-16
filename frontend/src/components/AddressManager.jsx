import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export function AddressManager({ addresses, onUpdate }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/address/add', formData);
      if (data.success) {
        toast.success('Address added successfully');
        onUpdate(data.addresses);
        setShowAddForm(false);
        setFormData({
          fullName: '',
          phone: '',
          addressLine: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India',
          isDefault: false
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const { data } = await api.delete(`/auth/address/${addressId}`);
      if (data.success) {
        toast.success('Address deleted');
        onUpdate(data.addresses);
      }
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-2xl">Saved Addresses</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C] text-white text-xs rounded-full hover:bg-[#B76E79] transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl border border-[#E8C7B7]/30 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-serif text-lg">New Address Details</h4>
            <button onClick={() => setShowAddForm(false)} className="p-1 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Full Name</label>
              <input required name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Phone Number</label>
              <input required name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">ZIP Code</label>
              <input required name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">Street Address</label>
              <input required name="addressLine" value={formData.addressLine} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">City</label>
              <input required name="city" value={formData.city} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 ml-1">State</label>
              <input required name="state" value={formData.state} onChange={handleInputChange} className="w-full mt-1 px-4 py-2.5 bg-[#FDF8F3] border rounded-xl outline-none focus:border-[#B76E79]" />
            </div>
            <div className="sm:col-span-2 flex items-center gap-2 mt-2">
              <input type="checkbox" id="isDefault" name="isDefault" checked={formData.isDefault} onChange={handleInputChange} className="accent-[#B76E79]" />
              <label htmlFor="isDefault" className="text-xs font-medium text-gray-600">Set as default shipping address</label>
            </div>
            <button
              disabled={loading}
              className="sm:col-span-2 py-3 bg-[#B76E79] text-white rounded-xl font-medium hover:bg-[#A65D68] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Address
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses?.map((addr) => (
          <div key={addr._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative group hover:border-[#B76E79]/30 transition-all">
            {addr.isDefault && (
              <div className="absolute top-4 right-4 text-[#B76E79]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#FDF8F3] rounded-lg">
                <MapPin className="w-4 h-4 text-[#B76E79]" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm">{addr.fullName}</p>
                <p className="text-xs text-gray-500">{addr.phone}</p>
                <p className="text-xs text-gray-600 leading-relaxed mt-2">
                  {addr.addressLine}, {addr.city},<br />
                  {addr.state} - {addr.zipCode}
                </p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleDelete(addr._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {(!addresses || addresses.length === 0) && !showAddForm && (
          <div className="md:col-span-2 py-12 text-center bg-white/50 border-2 border-dashed rounded-3xl">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500 italic">No saved addresses yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
