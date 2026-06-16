import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight,
  Package,
  Calendar,
  Award,
  Star,
  ArrowUpRight,
  Camera,
  Check,
  X,
  Loader2,
  Lock
} from 'lucide-react';

import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { AddressManager } from '../components/AddressManager';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

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

  console.log("API Products:", wishlist.products);
  // Sync user addresses when user data loads
  useEffect(() => {
    if (user) {
      setUserAddresses(user.addresses || []);
      setEditData({ name: user.name, phone: user.phone || '' });
      setImagePreview(user.avatar?.url || null);
    }
  }, [user]);
  ``
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  const validWishlistItems = wishlist;
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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
        await refreshUser(); // Refresh global user state
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

  // Sync hash with tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setActiveTab(hash || 'profile');
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Change tab
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);

    if (tabId === 'profile') {
      window.location.hash = '';
    } else {
      window.location.hash = tabId;
    }

    setIsMobileMenuOpen(false);
  };

  // User stats
  const userStats = {
    tier: 'Diamond Orchid Elite',
    points: 2450,
    nextTierPoints: 3000,
    memberSince: 'Nov 2024',
  };




  // Sidebar menu
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

      {/* Background */}
      <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-bl from-[#FFF0EB] via-[#E8C7B7]/10 to-transparent blur-[130px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-gradient-to-tr from-[#D4AF37]/5 to-[#FFF0EB] blur-[150px]" />

      {/* Gold Dust */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8C7B7] opacity-30 profile-gold-dust"
            style={{
              width: `${Math.random() * 4 + 3}px`,
              height: `${Math.random() * 4 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${14 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 max-w-[1400px]">

        {/* Banner */}
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

              <span className="text-xs uppercase tracking-[0.25em] text-[#E8C7B7]">
                Private Lounge
              </span>
            </div>

            <h1 className="font-serif text-white text-2xl sm:text-4xl font-light">
              Welcome Back,
              <span className="italic text-[#FFF0EB]"> {user?.name || 'Guest'}</span>
            </h1>

            <p className="text-white/60 text-xs sm:text-sm mt-2 max-w-md">
              Your luxury profile dashboard awaits.
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* Mobile Toggle */}
          <div className="col-span-12 lg:hidden flex justify-end">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-5 py-3 bg-white border rounded-full text-xs uppercase tracking-widest"
            >
              {isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            </button>
          </div>

          {/* Sidebar */}
          <div
            className={`col-span-12 lg:col-span-3 bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg transition-all duration-500 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'
              }`}
          >

            {/* Profile */}
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

              <h2 className="font-serif text-lg font-medium text-[#2C2C2C]">
                {user?.name}
              </h2>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#B76E79]/10 to-[#D4AF37]/10 rounded-full border border-[#E8C7B7]/30 mt-1.5">
                <Star className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />

                <span className="text-[10px] uppercase font-semibold tracking-wider text-[#2C2C2C]/80">
                  Elite Member
                </span>
              </div>
            </div>

            {/* Menu */}
            <nav className="mt-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-md font-medium transition-all ${isActive
                      ? 'bg-gradient-to-r from-[#FFF0EB] to-white text-[#B76E79]'
                      : 'hover:bg-white/40 text-[#2C2C2C]/70'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>

                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })}

              {/* Logout */}
              <div className="pt-4 mt-4 border-t border-[#E8C7B7]/20">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-red-50 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>

          {/* Main */}
          <div className="col-span-12 lg:col-span-9 space-y-8">

            {/* PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-fade-in-slow">
                {/* Account Info */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl">
                      Account Details
                    </h3>

                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="px-4 py-2 text-xs border rounded-full hover:bg-stone-50 transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#2C2C2C]/40 ml-1">
                        Full Name
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full mt-1 py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#B76E79]/30 outline-none focus:border-[#B76E79]"
                        />
                      ) : (
                        <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20">
                          {user?.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#2C2C2C]/40 ml-1">
                        Email Address
                      </span>
                      <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20 opacity-60">
                        {user?.email}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#2C2C2C]/40 ml-1">
                        Phone Number
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                          className="w-full mt-1 py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#B76E79]/30 outline-none focus:border-[#B76E79]"
                        />
                      ) : (
                        <p className="py-3 px-4 bg-[#FDF8F3]/60 rounded-xl border border-[#E8C7B7]/20">
                          {user?.phone || 'Not Provided'}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="pt-4">
                        <button
                          disabled={updateLoading}
                          type="submit"
                          className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-medium hover:bg-[#A65D68] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updateLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Update Profile Information
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* ADDRESSES */}
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



            {/* ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">

                {/* Header Section */}
                <div className="flex justify-between items-end pb-2 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-2xl text-stone-800 tracking-wide">
                      Order History
                    </h3>
                    <p className="text-xs text-stone-400 mt-1">
                      Manage and track your recent purchases
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-stone-100 text-stone-600 px-3 py-1 rounded-full">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>

                {/* Loading State */}
                {ordersLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="w-8 h-8 border-3 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-100 shadow-sm max-w-md mx-auto">
                    <div className="w-16 h-16 bg-[#FFF0EB] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-7 h-7 text-[#B76E79]" />
                    </div>
                    <h4 className="text-base font-medium text-stone-800 mb-1">No orders yet</h4>
                    <p className="text-sm text-stone-500 max-w-xs mx-auto px-4">
                      Once you place an order, it will appear here with its tracking details.
                    </p>
                  </div>
                ) : (
                  /* Orders List */
                  <div className="space-y-4">
                    {orders.map((order, index) => {
                      // Dynamic status styling logic
                      const status = order.orderStatus?.toUpperCase() || 'PROCESSING';
                      const isDelivered = status === 'DELIVERED';
                      const isCancelled = status === 'CANCELLED';

                      let statusClasses = "bg-amber-50 text-amber-700 border-amber-200"; // Default
                      if (isDelivered) statusClasses = "bg-emerald-50 text-emerald-700 border-emerald-100";
                      if (isCancelled) statusClasses = "bg-rose-50 text-rose-700 border-rose-100";

                      return (
                        <div
                          key={order._id || index}
                          className="bg-white rounded-2xl p-5 md:p-6 border border-stone-100 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {/* Order Meta Header */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-stone-100 pb-4 mb-4 text-left">
                            <div>
                              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
                                Order ID
                              </p>
                              <p className="text-sm font-mono font-medium text-stone-800 truncate max-w-[140px]">
                                #{order._id?.slice(-8) || index}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
                                Date Placed
                              </p>
                              <p className="text-sm text-stone-600 font-medium">
                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
                                Total Amount
                              </p>
                              <p className="text-sm font-bold text-stone-900">
                                ₹{order.totalPrice?.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="flex sm:justify-end items-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusClasses}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>

                          {/* Order Items & Actions */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-stone-800 line-clamp-1">
                                {order.orderItems?.[0]?.name}
                                {order.orderItems?.length > 1 && (
                                  <span className="text-xs font-normal text-stone-500 ml-1.5">
                                    + {order.orderItems.length - 1} more item{order.orderItems.length > 2 ? 's' : ''}
                                  </span>
                                )}
                              </h4>
                              <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-300"></span>
                                Payment via {order.paymentMethod}
                              </p>
                            </div>

                            {/* Interactive Action Buttons */}
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                              {isDelivered && (
                                <button
                                  onClick={() => navigate(`/give-review/${order.orderItems[0]?.product}`)}
                                  className="flex-1 sm:flex-none px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl transition duration-150 border border-amber-200"
                                >
                                  Leave a Review
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/order-detail/${order._id}`)}
                                className="flex-1 sm:flex-none px-5 py-2 bg-stone-900 hover:bg-[#B76E79] text-white text-xs font-medium rounded-xl shadow-sm transition duration-150"
                              >
                                Track Order
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">

                <div>
                  <h3 className="font-serif text-2xl">
                    Wishlist
                  </h3>

                  <p className="text-xs text-[#2C2C2C]/50 mt-1">
                    Your saved luxury pieces.
                  </p>
                </div>

                {validWishlistItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {validWishlistItems.map((item) => (
                      <ProductCard
                        key={item.id || item._id}
                        id={item.id || item._id}
                        title={item.title || item.name}
                        price={item.price}
                        image={item.image}
                        tag={item.tag}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed">
                    <Heart className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                    <p className="font-serif text-gray-500">Your wishlist is empty</p>
                  </div>
                )}

              </div>
            )}

            {/* OTHER TABS */}
            {!['profile', 'orders', 'wishlist'].includes(activeTab) && (
              <div className="bg-white rounded-3xl p-12 text-center border shadow-sm">
                <Sparkles className="w-8 h-8 text-[#D4AF37] mx-auto mb-3" />

                <h3 className="font-serif text-xl capitalize mb-1">
                  {activeTab.replace('-', ' ')}
                </h3>

                <p className="text-sm text-[#2C2C2C]/50">
                  This section is under development.
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .profile-gold-dust {
          animation: profileDustFloat infinite linear;
        }

        @keyframes profileDustFloat {
          0% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 0;
          }

          15% {
            opacity: 0.3;
          }

          85% {
            opacity: 0.3;
          }

          100% {
            transform: translateY(-100vh) scale(0.7) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-spin-slow {
          animation: slowRingSpin 10s linear infinite;
        }

        @keyframes slowRingSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .animate-fade-in-slow {
          animation: entryPanelReveal 0.6s ease forwards;
        }

        @keyframes entryPanelReveal {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Profile;