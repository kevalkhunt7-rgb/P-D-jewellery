import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiLoader,
  FiTrash2,
  FiRotateCcw,
} from "react-icons/fi";
import api from "../utils/api";
import toast from "react-hot-toast";
import { DeleteModal } from "../components/DeleteModal";

const getStatusBadge = (status) => {
  const configs = {
    DELIVERED: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Delivered" },
    SHIPPED: { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Shipped" },
    PACKED: { className: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20", label: "Packed" },
    CONFIRMED: { className: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Confirmed" },
    PENDING: { className: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Pending" },
    CANCELLED: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Cancelled" },
    RETURNED: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Returned" },
    FAILED: { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "Failed" },
  };
  const config = configs[status?.toUpperCase()] || configs.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  );
};

const getCancellationBadge = (status) => {
  const configs = {
    None: { className: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "None" },
    Requested: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Requested" },
    Approved: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Approved" },
    Rejected: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Rejected" },
  };
  const config = configs[status] || configs.None;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  );
};

const getRefundBadge = (status) => {
  const configs = {
    NotRequired: { className: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Not Required" },
    Pending: { className: "bg-amber-500/10 text-amber-400 border-amber-500/20", label: "Pending" },
    Processing: { className: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Processing" },
    Processed: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Completed" },
    Completed: { className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Completed" },
    Failed: { className: "bg-rose-500/10 text-rose-400 border-rose-500/20", label: "Failed" },
  };
  const config = configs[status] || configs.NotRequired;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${config.className}`}>
      {config.label}
    </span>
  );
};

const filterOptions = [
  { id: "All", label: "All" },
  { id: "Requested", label: "Requested" },
  { id: "Approved", label: "Approved" },
  { id: "Rejected", label: "Rejected" },
  { id: "RefundPending", label: "Refund Pending" },
  { id: "RefundCompleted", label: "Refund Completed" },
  { id: "RefundFailed", label: "Refund Failed" },
];

export function CancellationRequests() {
  const [requestsData, setRequestsData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // Added for spin animation control
  const [approveModal, setApproveModal] = useState({ isOpen: false, orderId: null });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, orderId: null, reason: "" });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, orderId: null });
  const [processing, setProcessing] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    refundPending: 0,
    refundCompleted: 0,
    refundFailed: 0,
  });

  const fetchCancellationRequests = async () => {
    try {
      const { data } = await api.get(`/orders/admin/cancellation-requests${activeFilter !== "All" ? `?status=${activeFilter}` : ""}`);
      if (data.success) {
        setRequestsData(data.requests);
        
        let total = data.requests.length;
        let pendingApproval = 0;
        let approved = 0;
        let rejected = 0;
        let refundPending = 0;
        let refundCompleted = 0;
        let refundFailed = 0;
        
        data.requests.forEach(request => {
          if (request.cancellationStatus === "Requested") pendingApproval++;
          if (request.cancellationStatus === "Approved") approved++;
          if (request.cancellationStatus === "Rejected") rejected++;
          if (request.refundStatus === "Pending") refundPending++;
          if (request.refundStatus === "Processed" || request.refundStatus === "Completed") refundCompleted++;
          if (request.refundStatus === "Failed") refundFailed++;
        });
        
        setStats({
          total,
          pendingApproval,
          approved,
          rejected,
          refundPending,
          refundCompleted,
          refundFailed,
        });
      }
    } catch (error) {
      console.error("Failed to fetch cancellation requests", error);
      toast.error("Failed to load cancellation requests");
    } finally {
      setLoading(false);
      setIsRefreshing(false); // Turn off refresh spinner
    }
  };

  useEffect(() => {
    fetchCancellationRequests();
  }, [activeFilter]);

  // Wrapper function for the manual refresh button action
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchCancellationRequests();
  };

  const handleApprove = async () => {
    const { orderId } = approveModal;
    setProcessing(orderId);
    const loadToast = toast.loading("Approving cancellation and processing refund...");
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/approve-cancellation`);
      if (data.success) {
        toast.success("Cancellation approved and refund processed", { id: loadToast });
        setApproveModal({ isOpen: false, orderId: null });
        fetchCancellationRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve cancellation", { id: loadToast });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    const { orderId, reason } = rejectModal;
    setProcessing(orderId);
    const loadToast = toast.loading("Rejecting cancellation...");
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/reject-cancellation`, { rejectionReason: reason });
      if (data.success) {
        toast.success("Cancellation rejected", { id: loadToast });
        setRejectModal({ isOpen: false, orderId: null, reason: "" });
        fetchCancellationRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject cancellation", { id: loadToast });
    } finally {
      setProcessing(null);
    }
  };

  const handleSyncRefund = async (orderId) => {
    setProcessing(orderId);
    const loadToast = toast.loading("Syncing refund status...");
    try {
      const { data } = await api.get(`/orders/admin/refund-status/${orderId}`);
      if (data.success) {
        toast.success("Refund status synced", { id: loadToast });
        fetchCancellationRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to sync refund status", { id: loadToast });
    } finally {
      setProcessing(null);
    }
  };

  const handleRetryRefund = async (orderId) => {
    setProcessing(orderId);
    const loadToast = toast.loading("Retrying refund...");
    try {
      const { data } = await api.put(`/orders/admin/${orderId}/retry-refund`);
      if (data.success) {
        toast.success("Refund retried successfully", { id: loadToast });
        fetchCancellationRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to retry refund", { id: loadToast });
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async () => {
    const { orderId } = deleteModal;
    setProcessing(orderId);
    const loadToast = toast.loading("Deleting cancellation record...");
    try {
      const { data } = await api.delete(`/orders/admin/cancellation-record/${orderId}`);
      if (data.success) {
        toast.success("Cancellation record deleted", { id: loadToast });
        setDeleteModal({ isOpen: false, orderId: null });
        fetchCancellationRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record", { id: loadToast });
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requestsData.filter(
    (request) =>
      request._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentApproveRequest = requestsData.find(r => r._id === approveModal.orderId);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <FiRefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs uppercase tracking-widest">Loading Cancellation Requests</p>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 text-slate-200 p-1">
  {/* Approve Confirmation Modal */}
  {approveModal.isOpen && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2">Approve Cancellation & Refund</h2>
        <p className="text-xs text-slate-400 mb-4">
          Are you sure you want to approve this cancellation? This will attempt to process a refund via Razorpay and mark the order as cancelled.
        </p>

        {currentApproveRequest?.cancellationReason && (
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4.5 mb-5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">User's Cancellation Reason</span>
            <p className="text-xs text-slate-350 italic leading-relaxed">
              "{currentApproveRequest.cancellationReason}"
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setApproveModal({ isOpen: false, orderId: null })}
            className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={processing === approveModal.orderId}
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {processing === approveModal.orderId ? (
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Approve"
            )}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Reject Confirmation Modal */}
  {rejectModal.isOpen && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2">Reject Cancellation</h2>
        <p className="text-xs text-slate-400 mb-4">Please provide a reason for rejecting this cancellation request.</p>

        <div className="space-y-4 mb-6">
          <textarea
            value={rejectModal.reason}
            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
            placeholder="Enter rejection reason..."
            className="w-full h-24 bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500/50 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setRejectModal({ isOpen: false, orderId: null, reason: "" })}
            className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-300 text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-slate-800/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={processing === rejectModal.orderId || !rejectModal.reason.trim()}
            className="flex-1 px-4 py-2.5 bg-rose-600 text-white text-xs font-semibold uppercase tracking-widest rounded-xl hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {processing === rejectModal.orderId ? (
              <FiLoader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "Reject"
            )}
          </button>
        </div>
      </div>
    </div>
  )}


      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={handleDelete}
        title="Delete Cancellation Record"
        message="Are you sure you want to delete this cancellation record? This will reset all cancellation and refund data for the order."
      />

      {/* Title & Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Cancellation Requests</h1>
            <p className="text-xs text-slate-400 mt-0.5">Review and manage customer order cancellation requests</p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium hover:bg-slate-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-400 uppercase tracking-widest">Pending Approval</p>
            <p className="text-2xl font-bold text-amber-400">{stats.pendingApproval}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 uppercase tracking-widest">Approved</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <p className="text-xs text-rose-400 uppercase tracking-widest">Rejected</p>
            <p className="text-2xl font-bold text-rose-400">{stats.rejected}</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-xs text-amber-400 uppercase tracking-widest">Refund Pending</p>
            <p className="text-2xl font-bold text-amber-400">{stats.refundPending}</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <p className="text-xs text-emerald-400 uppercase tracking-widest">Refund Completed</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.refundCompleted}</p>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <p className="text-xs text-rose-400 uppercase tracking-widest">Refund Failed</p>
            <p className="text-2xl font-bold text-rose-400">{stats.refundFailed}</p>
          </div>
        </div>
      </div>

      {/* Content Container Block Wrapper */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm">
        {/* Filtering & Search */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex flex-col gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeFilter === filter.id ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700/50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative max-w-md">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by order ID, customer name, or email..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-amber-500/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">
                <th className="py-3 px-5 font-medium">Order ID</th>
                <th className="py-3 px-4 font-medium">Customer Name</th>
                <th className="py-3 px-4 font-medium">Cancellation Status</th>
                <th className="py-3 px-4 font-medium">Refund Status</th>
                <th className="py-3 px-4 font-medium">Refund Amount</th>
                <th className="py-3 px-4 font-medium">Refund ID</th>
                <th className="py-3 px-4 font-medium">Requested Date</th>
                <th className="py-3 px-4 font-medium">Reviewed Date</th>
                <th className="py-3 px-5 text-center font-medium w-64">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-500 font-medium">
                    No cancellation requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-slate-800/10 transition-colors group">
                    <td className="py-3.5 px-5 font-mono text-amber-500 font-medium tracking-tight">
                      {request._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="font-semibold text-slate-200">{request.user?.name || "Guest"}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{request.user?.email || "No email"}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getCancellationBadge(request.cancellationStatus)}</td>
                    <td className="py-3.5 px-4">{getRefundBadge(request.refundStatus)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      <div>
                        <div>₹{request.refundAmount?.toLocaleString() || "0"}</div>
                        {(request.displayCurrency === "USD" || request.paidCurrency === "USD") && (
                          <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                            ${(request.refundAmount / (request.exchangeRate || 83)).toFixed(2)} USD
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                      {request.refundId || "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {request.cancellationRequestedAt
                        ? new Date(request.cancellationRequestedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {request.cancellationReviewedAt
                        ? new Date(request.cancellationReviewedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/orders/${request._id}`}
                          title="View Details"
                          className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                        </Link>

                        {request.cancellationStatus === "Requested" && (
                          <>
                            <button
                              title="Approve Cancellation"
                              onClick={() => setApproveModal({ isOpen: true, orderId: request._id })}
                              disabled={processing === request._id}
                              className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-950 border border-slate-800/60 hover:border-emerald-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {processing === request._id ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiCheck className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              title="Reject Cancellation"
                              onClick={() => setRejectModal({ isOpen: true, orderId: request._id, reason: "" })}
                              disabled={processing === request._id}
                              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {processing === request._id ? (
                                <FiLoader className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FiX className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}

                        {request.refundId && (
                          <button
                            title="Sync Refund Status"
                            onClick={() => handleSyncRefund(request._id)}
                            disabled={processing === request._id}
                            className="p-2 text-slate-400 hover:text-blue-400 bg-slate-950 border border-slate-800/60 hover:border-blue-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {processing === request._id ? (
                              <FiLoader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FiRefreshCw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {request.refundStatus === "Failed" && (
                          <button
                            title="Retry Refund"
                            onClick={() => handleRetryRefund(request._id)}
                            disabled={processing === request._id}
                            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 border border-slate-800/60 hover:border-amber-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            {processing === request._id ? (
                              <FiLoader className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FiRotateCcw className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <button
                          title="Delete Record"
                          onClick={() => setDeleteModal({ isOpen: true, orderId: request._id })}
                          disabled={processing === request._id}
                          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {processing === request._id ? (
                            <FiLoader className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FiTrash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}