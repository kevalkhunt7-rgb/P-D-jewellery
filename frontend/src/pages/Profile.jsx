import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LogOut,
  Sparkles,
  ChevronRight,
  Star,
  Camera
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { AddressManager } from '../components/AddressManager';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { sanitizePhone, isValidPhone, PHONE_ERROR_MESSAGE } from '../utils/phoneValidation';

// Subcomponents imports
import { ProfileTab } from '../components/ProfileTab';
import { OrdersTab } from '../components/OrdersTab';
import { WishlistTab } from '../components/WishlistTab';

function Profile() {
  const { user, logout, refreshUser, loading: authLoading } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'profile';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [userAddresses, setUserAddresses] = useState(user?.addresses || []);

  // Sync user addresses when user data loads
  useEffect(() => {
    if (user) {
      setUserAddresses(user.addresses || []);
      setEditData({ name: user.name, phone: sanitizePhone(user.phone || '') });
      setImagePreview(user.avatar?.url || null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isValidPhone(editData.phone)) {
      return toast.error(PHONE_ERROR_MESSAGE);
    }
    setUpdateLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('phone', editData.phone);
      if (selectedFile) {
        formData.append('avatar', selectedFile);
      }

      const { data } = await api.put('/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        await refreshUser();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        setOrdersLoading(true);
        const { data } = await api.get('/orders/my-orders');
        if (data?.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  // Sync hash with tab navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveTab(hash || 'profile');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId === 'profile' ? '' : tabId;
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F3]">
        <div className="flex items-center gap-3 text-[#B76E79]">
          <div className="w-5 h-5 border-2 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm tracking-wide">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FDF8F3] relative overflow-hidden pt-6 pb-12">
      {/* Visual Background Layout Elements */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-[#FFF0EB] via-[#E8C7B7]/10 to-transparent blur-[130px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-[#D4AF37]/5 to-[#FFF0EB] blur-[150px]" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-[1400px]">
        
        {/* Banner Section */}
        <div className="w-full h-44 sm:h-56 rounded-[2rem] relative overflow-hidden mb-8 border border-white shadow-lg bg-[#2C2C2C]">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2C2C] via-[#2C2C2C]/50 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=80&w=1200"
            alt="Banner"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-8 sm:px-12">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-xs uppercase tracking-[0.25em] text-[#E8C7B7]">Private Lounge</span>
            </div>
            <h1 className="font-serif text-white text-2xl sm:text-4xl font-bold">
              Welcome Back, <span className="italic text-[#FFF0EB]"> {user?.name || 'Guest'}</span>
            </h1>
            <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-md">Your luxury profile dashboard awaits.</p>
          </div>
        </div>

        {/* Adaptive Layout Framework */}
        <div className="grid grid-cols-12 gap-8 items-start">
          
          {/* Mobile Navigation Toggle Button */}
          <div className="col-span-12 lg:hidden flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-5 py-3 bg-white border rounded-full text-xs uppercase tracking-widest"
            >
              {isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            </button>
          </div>

          {/* Persistent Sidebar Navigation Component */}
          <div className={`col-span-12 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg transition-all duration-500 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="text-center pb-6 border-b border-[#E8C7B7]/20">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#B76E79] via-[#E8C7B7] to-[#D4AF37] animate-spin-slow opacity-80" />
                <div className="absolute inset-[3px] rounded-full bg-[#FDF8F3] flex items-center justify-center overflow-hidden z-10">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-[#B76E79] flex items-center justify-center text-white text-3xl font-serif">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-[#E8C7B7] flex items-center justify-center text-[#2C2C2C] hover:text-[#B76E79] shadow-md transition-all duration-300 hover:scale-110 z-20 cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                  </label>
                )}
              </div>
              <h2 className="font-serif text-lg font-medium text-[#2C2C2C]">{user?.name}</h2>
              
            </div>

            <nav className="mt-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-md font-medium transition-all ${isActive ? 'bg-gradient-to-r from-[#FFF0EB] to-white text-[#B76E79]' : 'hover:bg-white/40 text-[#2C2C2C]/70'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}
              <div className="pt-4 mt-4 border-t border-[#E8C7B7]/20">
                <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-red-50 text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main Tab Content Panel Workspace */}
          <div className="col-span-12 lg:col-span-9 space-y-8">
            {activeTab === 'profile' && (
              <ProfileTab 
                user={user}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editData={editData}
                setEditData={setEditData}
                imagePreview={imagePreview}
                handleFileChange={handleFileChange}
                handleUpdateProfile={handleUpdateProfile}
                updateLoading={updateLoading}
              />
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white shadow-lg animate-fade-in-slow">
                <AddressManager
                  addresses={userAddresses}
                  onUpdate={(newAddresses) => {
                    setUserAddresses(newAddresses);
                    refreshUser();
                  }}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <OrdersTab orders={orders} ordersLoading={ordersLoading} navigate={navigate} />
            )}

            {activeTab === 'wishlist' && (
              <WishlistTab validWishlistItems={wishlist} />
            )}

            {!['profile', 'orders', 'wishlist', 'addresses'].includes(activeTab) && (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />
                <h3 className="font-serif text-xl capitalize mb-1">{activeTab.replace('-', ' ')}</h3>
                <p className="text-sm text-[#2C2C2C]/50">This section is under development.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        .profile-gold-dust { animation: profileDustFloat infinite linear; }
        @keyframes profileDustFloat {
          0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
          15% { opacity: 0.3; }
          85% { opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0.7) rotate(360deg); opacity: 0; }
        }
        .animate-spin-slow { animation: slowRingSpin 10s linear infinite; }
        @keyframes slowRingSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-fade-in-slow { animation: entryPanelReveal 0.6s ease forwards; }
        @keyframes entryPanelReveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default Profile;