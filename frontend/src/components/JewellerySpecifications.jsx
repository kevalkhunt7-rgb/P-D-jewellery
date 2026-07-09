import React from 'react';
import { ShieldCheck } from 'lucide-react';

const SpecItem = ({ label, value }) => {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === "") ||
        value === "N/A"
    ) {
        return null;
    }

    return (
        <div className="bg-stone-50/60 p-4 rounded-xl border border-stone-200/30 flex flex-col justify-between min-w-[140px]">
            <p className="text-[10px] uppercase tracking-widest text-stone-800 font-bold mb-1">
                {label}
            </p>
            <p className="text-sm font-semibold text-stone-800 leading-snug">
                {value}
            </p>
        </div>
    );
};

const SpecRow = ({ label, value }) => {
    if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === "") ||
        value === "N/A"
    ) {
        return null;
    }

    return (
        <div className="flex items-center justify-between gap-6 py-2.5 border-b border-stone-100 last:border-0 text-sm">
            <span className="text-stone-500 font-medium">{label}</span>
            <span className="font-semibold text-stone-800 text-right">{value}</span>
        </div>
    );
};

export function JewellerySpecifications({ product }) {
    if (!product) return null;

    const hasCert = !!(product.bisHallmarkNumber || product.certificateDetails);

    // Leverage the pre-calculated pricing object from backend controllers
    const priceBreakdown = product.pricing;

    return (
        <div className="w-full bg-stone-50/40 rounded-[2rem] border border-stone-200/60 p-6 md:p-8 mt-8">
            {/* FIX 1: Removed items-stretch from the row container to stop vertical pulling */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN 1: Product Specifications Layout */}
                <div className={`${hasCert ? 'lg:col-span-6' : 'lg:col-span-8'} w-full`}>
                    <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-6">
                        Product Specifications
                    </h3>

                    {/* FIX 2: Optimized grid auto-sizing based on realistic widths */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {product.specifications.map((specification, index) => (
                            <div
                                key={specification.id || `${specification.label}-${index}`}
                                /* FIX 3: Added h-full, min-h-[4.5rem], and tracking classes */
                                className="flex flex-col justify-center p-3.5 bg-white border border-stone-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#B76E79]/40 hover:shadow-sm transition-all duration-200 min-h-[4.5rem]"
                            >
                                {/* Label block styling */}
                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-stone-600 mb-1 block select-none">
                                    {specification.label}
                                </span>

                                {/* Value block styling - FIX 4: break-normal prevents broken words */}
                                {/* Value block styling */}
                                <span className="text-sm font-semibold text-stone-800 break-all overflow-hidden block w-full antialiased">
                                    {specification.value || <span className="text-stone-300 italic text-xs">--</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>



                {/* COLUMN 2: Verification Info */}
                {hasCert && (
                    /* FIX 1: Changed items-stretch parent effects by removing absolute flex-stretching on this column wrapper */
                    <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-stone-200/60 pt-6 lg:pt-0 lg:pl-8">
                        <div>
                            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-6">
                                Verification
                            </h3>

                            {/* Premium Highlight Card Container */}
                            <div className="bg-white border border-stone-200 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5 space-y-4">

                                {/* Header Badge Row */}
                                <div className="flex items-center gap-2.5 pb-3.5 border-b border-stone-100">
                                    <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                    </div>
                                    <span className="text-xs font-bold text-stone-800 tracking-wide">
                                        BIS Hallmarked Jewelry
                                    </span>
                                </div>

                                {/* Content Rows - FIX 2: Added stacked block layout for high-polish look */}
                                <div className="space-y-3.5">
                                    <div>
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-600 block mb-1">
                                            Hallmark Number
                                        </span>
                                        <span className="text-sm font-semibold text-stone-800 tracking-wide break-all">
                                            {product.bisHallmarkNumber || <span className="text-stone-300 italic text-xs">--</span>}
                                        </span>
                                    </div>

                                    <div className="pt-2 border-t border-stone-50">
                                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-600 block mb-1">
                                            Certificate Details
                                        </span>
                                        <span className="text-sm font-semibold text-stone-700 leading-relaxed break-normal block">
                                            {product.certificateDetails || <span className="text-stone-300 italic text-xs">--</span>}
                                        </span>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                )}
                {/* COLUMN 3: Cost Breakdown Ledgers */}
                <div className={`${hasCert ? 'lg:col-span-3' : 'lg:col-span-4'} border-t lg:border-t-0 lg:border-l border-stone-200/60 pt-6 lg:pt-0 lg:pl-8`}>
                    <div>
                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-6">
                            Cost Breakdown
                        </h3>

                        <div className="bg-white border border-stone-200 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] p-5">
                            {(() => {
                                if (!priceBreakdown) {
                                    return (
                                        <div className="flex items-center justify-center py-8">
                                            <p className="text-xs font-medium text-stone-400 italic">Pricing data loading...</p>
                                        </div>
                                    );
                                }

                                // 1. Extract raw data components
                                const metalValue = priceBreakdown.metalValue || 0;
                                const makingCharge = priceBreakdown.makingCharge || 0;
                                const originalPrice = priceBreakdown.originalPrice || 0;
                                const salePrice = priceBreakdown.salePrice || 0;
                                const discountPercentage = priceBreakdown.discountPercentage || 0;

                                // 2. Parse out explicit rates
                                const cgstRate = product.cgstRate !== undefined ? product.cgstRate : 1.5;
                                const sgstRate = product.sgstRate !== undefined ? product.sgstRate : 1.5;

                                const symbol = product.currencySymbol || '₹';
                                const currency = product.currency || 'INR';

                                // Calculate the conversion rate dynamically to convert labour charges per gram
                                const conversionRate = (product.currency === 'USD' && product.pricing && product.originalPrice)
                                    ? Number((product.pricing.originalPrice / product.originalPrice).toFixed(2))
                                    : 1;

                                const makingChargeValDisp = (product.currency === 'USD' && product.makingChargeType === 'per_gram')
                                    ? Number((product.makingChargeValue * conversionRate).toFixed(2))
                                    : product.makingChargeValue;

                                const formatVal = (val) => `${symbol}${val.toLocaleString(currency === 'USD' ? 'en-US' : 'en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                                // 3. Flexible Key Resolver (Checks variants: cgst, cgstValue, cgstAmount)
                                let cgstAmount = priceBreakdown.cgst ?? priceBreakdown.cgstValue ?? priceBreakdown.cgstAmount ?? 0;
                                let sgstAmount = priceBreakdown.sgst ?? priceBreakdown.sgstValue ?? priceBreakdown.sgstAmount ?? 0;

                                // 4. Absolute Fallback: If values are missing (0) but subtotal exists, calculate dynamically
                                const taxSubtotal = metalValue + makingCharge;
                                if (cgstAmount === 0 && taxSubtotal > 0) {
                                    cgstAmount = taxSubtotal * (cgstRate / 100);
                                }
                                if (sgstAmount === 0 && taxSubtotal > 0) {
                                    sgstAmount = taxSubtotal * (sgstRate / 100);
                                }

                                return (
                                    <div className="space-y-4 max-w-sm"> {/* Adjust width layout container as needed */}
                                        {/* Breakdown Ledger Section */}
                                        <div className="pb-4 border-b border-stone-100">
                                            <table className="w-full table-fixed border-collapse">
                                                <thead>
                                                    <tr className="sr-only">
                                                        <th scope="col" className="w-1/2">Description</th>
                                                        <th scope="col" className="w-1/2">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Metal Value */}
                                                    <tr className="group">
                                                        <td className="py-2 align-top">
                                                            <span className="text-[12px] font-bold uppercase tracking-wider   text-stone-600 block">
                                                                Total Metal Value
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-sm font-semibold text-stone-800 text-right align-top">
                                                            {formatVal(metalValue)}
                                                        </td>
                                                    </tr>

                                                    {/* Making Charges */}
                                                    <tr className="group">
                                                        <td className="py-2 align-top">
                                                            <span className="text-[12px] font-bold uppercase tracking-wider text-stone-600 block">
                                                                {product.makingChargeType === "percentage"
                                                                    ? `Making Charges (${product.makingChargeValue}%)`
                                                                    : `Making Charges (${symbol}${makingChargeValDisp}/g)`}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 text-sm font-semibold text-stone-800 text-right align-top">
                                                            {formatVal(makingCharge)}
                                                        </td>
                                                    </tr>

                                                    {/* Taxes Block (Grid Embedded via single cell) */}
                                                    <tr>
                                                        <td colSpan={2} className="pt-3 pb-1">
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {/* CGST Mini-Table Card */}
                                                                <div className="bg-stone-50/60 rounded-xl p-2.5 border border-stone-100">
                                                                    <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider block mb-0.5">
                                                                        CGST ({cgstRate}%)
                                                                    </span>
                                                                    <span className="text-xs font-bold text-stone-700 block">
                                                                        {formatVal(cgstAmount)}
                                                                    </span>
                                                                </div>

                                                                {/* SGST Mini-Table Card */}
                                                                <div className="bg-stone-50/60 rounded-xl p-2.5 border border-stone-100">
                                                                    <span className="text-[12px] font-bold text-stone-600 uppercase tracking-wider block mb-0.5">
                                                                        SGST ({sgstRate}%)
                                                                    </span>
                                                                    <span className="text-xs font-bold text-stone-700 block">
                                                                        {formatVal(sgstAmount)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pricing Summary Section */}
                                        <div>
                                            <table className="w-full table-fixed border-collapse">
                                                <thead>
                                                    <tr className="sr-only">
                                                        <th scope="col" className="w-1/2">Summary Item</th>
                                                        <th scope="col" className="w-1/2">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Subtotal */}
                                                    <tr className="text-stone-600">
                                                        <td className="py-2 align-middle">
                                                            <span className="text-[15px] font-bold block">Subtotal</span>
                                                        </td>
                                                        <td className="py-2 text-[15px] font-bold text-stone-700 text-right align-middle">
                                                            {formatVal(originalPrice)}
                                                        </td>
                                                    </tr>

                                                    {/* Discount Row (Fully embedded cell to prevent breakages) */}
                                                    {discountPercentage > 0 && (
                                                        <tr>
                                                            <td colSpan={2} className="py-1.5">
                                                                <div className="flex justify-between items-center bg-rose-50/50 px-3 py-1.5 rounded-xl border border-rose-100/60 text-[#B76E79]">
                                                                    <span className="text-xs font-bold">
                                                                        Discount (-{discountPercentage}%)
                                                                    </span>
                                                                    <span className="text-xs font-bold">
                                                                        -{formatVal(originalPrice - salePrice)}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Final Total Badge Row */}
                                                    <tr>
                                                        <td colSpan={2} className="pt-3">
                                                            <div className="flex justify-between items-center bg-stone-900 text-white p-3.5 rounded-xl shadow-sm shadow-stone-900/10">
                                                                <span className="text-xs font-bold uppercase tracking-widest text-stone-300">
                                                                    Final Price
                                                                </span>
                                                                <span className="text-lg font-bold tracking-wide">
                                                                    {formatVal(salePrice)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}