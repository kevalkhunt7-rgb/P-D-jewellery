import { useState, useEffect, useRef } from "react";
// FIX: Changed import package from "react-router" to "react-router-dom"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import administrator from "../assets/logo.png";
import { AnimatePresence, motion } from "framer-motion"; // 🚀 Added motion explicit import here
import { HiCheck, HiOutlineBellAlert } from 'react-icons/hi2';

// Clean, reliable icon packages from react-icons
import {
  HiOutlineSquares2X2,
  HiOutlineShoppingBag,
  HiOutlineFolder,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineTicket,
  HiOutlineStar,
  HiOutlinePhoto,
  HiOutlineHomeModern,
  HiOutlineChartBar,
  HiOutlineCog6Tooth,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineEnvelope,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineExclamationTriangle
} from "react-icons/hi2";

const menuItems = [
  { icon: HiOutlineSquares2X2, label: "Dashboard", path: "/" },
  { icon: HiOutlineShoppingBag, label: "Products", path: "/products" },
  { icon: HiOutlineFolder, label: "Categories", path: "/categories" },
  { icon: HiOutlineShoppingCart, label: "Orders", path: "/orders" },
  { icon: HiOutlineExclamationTriangle, label: "Cancellation Requests", path: "/cancellation-requests" },
  { icon: HiOutlineUsers, label: "Customers", path: "/customers" },
  { icon: HiOutlineTicket, label: "Coupons", path: "/coupons" },
  { icon: HiOutlineStar, label: "Reviews", path: "/reviews" },
  { icon: HiOutlinePhoto, label: "Banners", path: "/banners" },
  { icon: HiOutlineHomeModern, label: "Inventory", path: "/inventory" },
  { icon: HiOutlineChartBar, label: "Analytics", path: "/analytics" },
  // 🔐 Added dynamic constraint key for access protection management
  { icon: HiOutlineCog6Tooth, label: "Settings", path: "/settings", requiresSuperAdmin: true },
];

export function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    const saved = localStorage.getItem('dismissedNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fetch alerts for notifications
  const fetchAlerts = async () => {
    try {
      const { data } = await api.get("/admin/dashboard-stats");
      if (data.success) {
        const alerts = [];

        // Low Stock Alerts
        if (data.lowStockItems && data.lowStockItems.length > 0) {
          data.lowStockItems.forEach(item => {
            alerts.push({
              id: `stock-${item._id}`,
              type: 'low_stock',
              title: 'Low Stock Alert',
              message: `${item.name} is low on stock (${item.stock} left)`,
              time: 'Action Required',
              icon: HiOutlineExclamationTriangle,
              color: 'text-amber-500',
              bg: 'bg-amber-500/10'
            });
          });
        }

        // New Orders (last 5)
        if (data.recentOrders && data.recentOrders.length > 0) {
          data.recentOrders.forEach(order => {
            const isNew = new Date(order.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
            if (isNew) {
              alerts.push({
                id: `order-${order._id}`,
                type: 'new_order',
                title: 'New Order Received',
                message: `Order #${order._id.substring(0, 8)} placed by customer`,
                time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                icon: HiOutlineShoppingCart,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              });
            }
          });
        }

        // Filter out dismissed notifications
        const filteredAlerts = alerts.filter(alert => !dismissedNotifications.includes(alert.id));
        setNotifications(filteredAlerts);
      }
    } catch (error) {
      console.error("Failed to fetch alerts", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
   
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dismissedNotifications]);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    const newDismissed = [...dismissedNotifications, id];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications([]);
    const newDismissed = [...dismissedNotifications, ...allIds];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if current path or sub-route is active
  const isRouteActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Reusable Sidebar Content Layout
  const SidebarContent = ({ isMobile = false }) => (
    <div className="h-full flex flex-col bg-slate-900 text-slate-100 selection:bg-amber-500/20">
      {/* Brand Logo Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between min-h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <div><img src={administrator} alt="P&D Luxury Jewellery" className="w-12 h-12 " /></div>  
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex flex-col opacity-100 transition-opacity duration-300">
              <h1 className="text-sm font-semibold tracking-tight leading-none text-white">
                P&D Luxury Jewellery
              </h1>
              <span className="text-[10px] font-medium tracking-wider uppercase text-amber-500/70 mt-1">
                {admin?.role === "superAdmin" ? "Super Admin" : "Admin"}
              </span>
            </div>
          )}
        </div>

        {/* Mobile View Toggle Close Icon */}
        {isMobile && (
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Layout System */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-1 scrollbar-none">
        {menuItems.map((item) => {
          // 🔐 Enforce security bounds matching user profile payload rules
          if (item.requiresSuperAdmin && admin?.role !== "superAdmin") {
            return null;
          }

          const Icon = item.icon;
          const isActive = isRouteActive(item.path);
          const showLabel = !sidebarCollapsed || isMobile;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setMobileMenuOpen(false)}
              title={!showLabel ? item.label : undefined}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${isActive
                  ? "bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/10 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-slate-950" : "text-slate-400 group-hover:text-slate-100"
                  }`}
              />

              {showLabel ? (
                <span className="text-xs tracking-wide">{item.label}</span>
              ) : (
                // Hover Micro Tooltip Fallback for Collapsed Sidebar
                <div className="absolute left-16 scale-0 rounded bg-slate-950 px-2 py-1 text-xs font-medium text-slate-200 shadow-xl group-hover:scale-100 transition-all origin-left z-50 pointer-events-none whitespace-nowrap border border-slate-800">
                  {item.label}
                </div>
              )}

              {isActive && (
                <div className="absolute right-2 w-1 h-4 rounded-full bg-slate-950/40" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Action Footers */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/20">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 relative"
          title={sidebarCollapsed && !isMobile ? "Logout" : undefined}
        >
          <HiOutlineArrowLeftOnRectangle className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
          {!sidebarCollapsed || isMobile ? (
            <span className="text-xs font-medium tracking-wide">Logout</span>
          ) : (
            <div className="absolute left-16 scale-0 rounded bg-rose-950 px-2 py-1 text-xs font-medium text-rose-400 shadow-xl group-hover:scale-100 transition-all origin-left z-50 pointer-events-none whitespace-nowrap border border-rose-900/50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-row overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/10">

      {/* Desktop Persistent Sidebar Element */}
      <aside
        className={`hidden lg:block h-full border-r border-slate-900 bg-slate-900 transition-all duration-300 ease-in-out z-30 flex-shrink-0 ${sidebarCollapsed ? "w-[90px]" : "w-60"
          }`}
      >
        <SidebarContent />
      </aside>

      {/* Custom Mobile Drawer / Sheet Backing Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Dimmer Surface */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer Sliding Layout View Canvas */}
          <div className="relative flex flex-col w-64 max-w-xs h-full bg-slate-900 border-r border-slate-800 shadow-2xl">
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Primary Dashboard Content Layout Engine */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">

        {/* Top Header Navigation Dashboard bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-900/80 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between gap-4 z-20 sticky top-0 flex-shrink-0">

          <div className="flex items-center gap-2.5 max-w-md">
            {/* Mobile Sidebar Hamburger Drawer Controller Toggle */}
            <button
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 active:scale-95 transition-all"
              onClick={() => setMobileMenuOpen(true)}
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>

            {/* Desktop Collapse Window Width View Toggle Button */}
            <button
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-100 active:scale-95 transition-all duration-200"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <HiOutlineChevronRight className="w-4 h-4" />
              ) : (
                <HiOutlineChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right Action Icons Row Profiles */}
          <div className="flex items-center gap-1.5">

            {/* Mail Box Inbox Icon component notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative h-9 w-9 flex items-center justify-center rounded-xl transition-all duration-200 ${notificationsOpen ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  }`}
              >
                <HiOutlineEnvelope className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-amber-500 text-slate-950 text-[10px] font-bold rounded-full border-2 border-slate-900 animate-pulse">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-3 w-85 sm:w-100 bg-slate-900/95 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-50 overflow-hidden ring-1 ring-white/5"
                  >
                    {/* Header Section */}
                    <div className="p-4 border-b border-slate-800/60 bg-slate-950/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <HiOutlineBellAlert className="w-4 h-4 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                            System Alerts
                          </h3>
                          <p className="text-[9px] text-slate-500 uppercase tracking-[0.15em] font-medium mt-0.5">
                            Live Intelligence Feed
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/50 text-slate-300 text-[10px] font-bold tracking-wide">
                        {notifications.length} Active
                      </span>
                    </div>

                    {/* Scrollable Notification List */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-800/40 [scrollbar-width:thin] [scrollbar-color:#1e293b_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
                      <AnimatePresence initial={false}>
                        {notifications.length === 0 ? (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-12 text-center flex flex-col items-center justify-center"
                          >
                            <div className="w-12 h-12 bg-gradient-to-b from-slate-800/40 to-slate-900/60 border border-slate-800/50 rounded-2xl flex items-center justify-center mb-3.5 shadow-inner">
                              <HiOutlineEnvelope className="w-5 h-5 text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-300 font-medium tracking-wide">
                              All Systems Clear
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                              No active network anomalies or pending operational tasks.
                            </p>
                          </motion.div>
                        ) : (
                          notifications.map((notif) => {
                            const Icon = notif.icon || HiOutlineBellAlert;
                            return (
                              <motion.div
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20, height: 0, transition: { duration: 0.2 } }}
                                className="p-4 hover:bg-slate-800/30 transition-all duration-150 relative group border-l-2 border-transparent hover:border-amber-500/40"
                              >
                                <div className="flex gap-3.5">
                                  <div className={`w-9 h-9 rounded-xl ${notif.bg || 'bg-slate-800'} flex items-center justify-center flex-shrink-0 border border-white/5 shadow-md relative`}>
                                    <Icon className={`w-4 h-4 ${notif.color || 'text-slate-300'}`} />
                                    <span className={`absolute inset-0 rounded-xl blur-sm opacity-20 ${notif.color}`} />
                                  </div>

                                  <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                      <h4 className="text-xs font-semibold text-slate-200 tracking-wide truncate group-hover:text-white transition-colors">
                                        {notif.title}
                                      </h4>
                                      <span className="text-[9px] font-medium text-slate-500 tracking-tight whitespace-nowrap">
                                        {notif.time}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-bold">
                                      {notif.message}
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notif.id);
                                  }}
                                  className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-slate-800 hover:text-slate-200 border border-transparent hover:border-slate-700/50 transition-all duration-150"
                                >
                                  <HiOutlineXMark className="w-3.5 h-3.5" />
                                </button>
                              </motion.div>
                            );
                          })
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Footer Control Strip */}
                    {notifications.length > 0 && (
                      <div className="p-3 bg-slate-950/60 border-t border-slate-800/60 text-center flex items-center justify-center">
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-amber-400 uppercase tracking-wider transition-colors duration-150 py-1 px-3 rounded-lg hover:bg-amber-500/5 border border-transparent hover:border-amber-500/10"
                        >
                          <HiCheck className="w-3.5 h-3.5" />
                          Clear Archive
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div> 

            <div className="w-[1px] h-5 bg-slate-800 mx-1 hidden sm:block" />

            {/* Custom Micro Dropdown Menu Framework */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl text-left hover:bg-slate-800/60 active:scale-[0.99] transition-all"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner flex-shrink-0">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="hidden lg:block max-w-[120px]">
                  <p className="text-xs font-semibold leading-tight text-slate-200 truncate">{admin?.name || "Admin User"}</p>
                  <p className="text-[10px] text-slate-500 tracking-wide truncate mt-0.5">{admin?.email || "admin@jewel.com"}</p>
                </div>
              </button>

              {/* Profile Dropdown Menu Surface */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 py-1.5">
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1.5">
                    My Account
                  </div>
                  <div className="h-[1px] bg-slate-800 my-1 mx-2" />

                  <button className="w-full text-left text-xs px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                    Profile
                  </button>
                  {/* 🔐 Optional profile action role display check */}
                  {admin?.role === "superAdmin" && (
                    <button 
                      onClick={() => { setProfileDropdownOpen(false); navigate('/settings'); }}
                      className="w-full text-left text-xs px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
                    >
                      Settings
                    </button>
                  )}

                  <div className="h-[1px] bg-slate-800 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-xs px-3 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center font-medium"
                  >
                    <HiOutlineArrowLeftOnRectangle className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Global Page Content Grid Outlet Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-5 lg:p-6 select-text scroll-smooth">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}