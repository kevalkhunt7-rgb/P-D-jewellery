import { useState, useEffect } from "react";
import {
  FiPlus,
  FiCopy,
  FiEdit3,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { DeleteModal } from "../components/DeleteModal";

export function Coupons() {

  const [couponsData, setCouponsData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, couponId: null });


  // ================= FETCH DATA =================
  const fetchCoupons = async () => {
  try {

    // Fetch Coupons
    const couponRes = await api.get("/coupons/all");

    if (couponRes.data.success) {
      setCouponsData(couponRes.data.coupons);
    }

    // Fetch Orders
    const ordersRes = await api.get("/orders/all-orders");

    if (ordersRes.data.success) {
      setOrders(ordersRes.data.orders);
    }

  } catch (error) {
    console.error("Failed to fetch data:", error);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCoupons();
  }, []);


  // ================= DELETE COUPON =================
  const handleDeleteCoupon = async () => {
    const { couponId } = deleteModal;
    const loadToast = toast.loading("Deleting coupon...");

    try {

      const { data } = await api.delete(`/coupons/delete/${couponId}`);

      if (data.success) {

        toast.success("Coupon deleted successfully", {
          id: loadToast,
        });

        fetchCoupons();
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message || "Failed to delete coupon",
        {
          id: loadToast,
        }
      );
    }
  };


  // ================= COPY CODE =================
  const handleCopyCode = (code) => {

    navigator.clipboard.writeText(code);

    setCopiedCode(code);

    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };


  // ================= STATS =================
  const totalCoupons = couponsData.length;

  const activeCoupons = couponsData.filter(
    (c) =>
      c.isActive &&
      new Date(c.expiryDate) > new Date()
  ).length;

  const totalUses = couponsData.reduce(
    (sum, c) => sum + (c.usedCount || 0),
    0
  );

  // CORRECT TOTAL DISCOUNT CALCULATION
  const totalDiscounts = orders.reduce(
    (sum, order) => {
      return sum + Number(order.discountAmount || 0);
    },
    0
  );


  if (loading) {
    return (
      <div className="text-white p-6">
        Loading coupons...
      </div>
    );
  }


  return (
    <div className="space-y-6 text-slate-200 p-1">
      {/* Delete Confirmation Modal */}
      <DeleteModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, couponId: null })}
        onConfirm={handleDeleteCoupon}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon? This action cannot be undone."
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Coupons
          </h1>

          <p className="text-xs text-slate-400 mt-0.5">
            Manage discount codes and promotions
          </p>
        </div>

        <Link to="/create-coupon">
          <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-amber-500/10">
            <FiPlus className="w-4 h-4 stroke-[3]" />
            Create Coupon
          </button>
        </Link>

      </div>


      {/* STATS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {[
          {
            label: "Total Coupons",
            value: totalCoupons,
          },
          {
            label: "Active Coupons",
            value: activeCoupons,
          },
          {
            label: "Total Uses",
            value: totalUses.toLocaleString(),
          },
          {
            label: "Total Discounts",
            value: `₹${totalDiscounts.toLocaleString()}`,
          },
        ].map((stat, idx) => (

          <div
            key={idx}
            className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-sm"
          >
            <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              {stat.label}
            </p>

            <p className="text-2xl font-bold text-white mt-2 tracking-tight">
              {stat.value}
            </p>
          </div>

        ))}

      </div>


      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">

        <div className="px-5 py-4 border-b border-slate-800/60">
          <h2 className="text-sm font-bold text-white tracking-wide">
            All Coupons
          </h2>
        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left border-collapse">

            <thead>
              <tr className="border-b border-slate-800 text-[11px] tracking-wider text-slate-400 uppercase font-semibold bg-slate-950/20">

                <th className="py-3 px-5 font-medium">
                  Code
                </th>

                <th className="py-3 px-4 font-medium">
                  Discount
                </th>

                <th className="py-3 px-4 font-medium">
                  Usage
                </th>

                <th className="py-3 px-4 font-medium">
                  Expires
                </th>

                <th className="py-3 px-4 font-medium">
                  Status
                </th>

                <th className="py-3 px-5 text-center font-medium w-48">
                  Actions
                </th>

              </tr>
            </thead>


            <tbody className="divide-y divide-slate-800/50 text-xs">

              {couponsData.map((coupon) => (

                <tr
                  key={coupon._id}
                  className="hover:bg-slate-800/10 transition-colors group"
                >

                  {/* CODE */}
                  <td className="py-3.5 px-5">

                    <div className="flex items-center gap-2">

                      <span className="font-mono font-bold text-amber-500 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10 uppercase tracking-wider">
                        {coupon.code}
                      </span>

                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="p-1.5 text-slate-500 hover:text-white transition-colors"
                      >
                        {copiedCode === coupon.code ? (
                          <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <FiCopy className="w-3.5 h-3.5" />
                        )}
                      </button>

                    </div>

                  </td>


                  {/* DISCOUNT */}
                  <td className="py-3.5 px-4">

                    <div className="font-medium text-slate-200">

                      {coupon.discountType === "percentage"
                        ? `${coupon.discountValue}% Off`
                        : `₹${coupon.discountValue} Off`}

                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Min. Order: ₹{coupon.minimumOrderAmount}
                    </div>

                  </td>


                  {/* USAGE */}
                  <td className="py-3.5 px-4">

                    <div className="text-slate-300 font-medium">
                      {coupon.usedCount} used
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Limit: {coupon.usageLimit}
                    </div>

                  </td>


                  {/* EXPIRY */}
                  <td className="py-3.5 px-4">

                    <div className="text-slate-400 font-medium">
                      {new Date(coupon.expiryDate).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </div>

                  </td>


                  {/* STATUS */}
                  <td className="py-3.5 px-4">

                    {new Date() < new Date(coupon.expiryDate) &&
                    coupon.isActive ? (

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                        Active
                      </span>

                    ) : (

                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                        Expired
                      </span>

                    )}

                  </td>


                  {/* ACTIONS */}
                  <td className="py-3.5 px-5">

                    <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">

                      <Link
                        to={`/edit-coupon/${coupon._id}`}
                        title="Edit Coupon"
                        className="p-2 text-slate-400 hover:text-white bg-slate-950 border border-slate-800/60 hover:border-slate-700 rounded-lg transition-all"
                      >
                        <FiEdit3 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        title="Delete Coupon"
                        onClick={() => setDeleteModal({ isOpen: true, couponId: coupon._id })}
                        className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 border border-slate-800/60 hover:border-rose-500/30 rounded-lg transition-all"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}