import React from 'react';
import { ShieldCheck } from 'lucide-react';

const SpecItem = ({ label, value, unit = "" }) => {
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
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
                {label}
            </p>
            <p className="text-sm font-semibold text-stone-800 leading-snug">
                {value}{unit ? ` ${unit}` : ""}
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
        <div className="w-full bg-white rounded-[2.5rem] border border-stone-200/50 p-8 shadow-sm mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                
                {/* COLUMN 1: Product Specifications Layout */}
                <div className={`${hasCert ? 'lg:col-span-6' : 'lg:col-span-8'} flex flex-col justify-between`}>
                    <div>
                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-5">
                            Product Specifications
                        </h3>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <SpecItem label="Base Material" value={product.baseMaterial} />
                            <SpecItem label="Purity" value={product.purity} />
                            <SpecItem label="Plating Type" value={product.platingType} />
                            <SpecItem label="Metal Color" value={product.metalColor} />
                            
                            <SpecItem label="Gross Weight" value={product.grossWeight} unit="g" />
                            <SpecItem label="Net Weight" value={product.netWeight} unit="g" />
                            
                            <SpecItem label="Occasion" value={product.occasion} />
                            <SpecItem label="Gender" value={product.gender} />
                            
                            <SpecItem label="Total Diamond Weight" value={product.diamondWeight} unit="ct" />
                            <SpecItem label="Number of Diamonds" value={product.diamondPieces} />
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Verification Info */}
                {hasCert && (
                    <div className="lg:col-span-3 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-200/60 pt-6 lg:pt-0 lg:pl-8">
                        <div>
                            <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-5">
                                Verification
                            </h3>
                            <div className="bg-stone-50/70 rounded-2xl p-4 border border-stone-200/40 h-full flex flex-col justify-center">
                                <div className="flex items-center gap-2 pb-3 mb-2 border-b border-stone-200/40">
                                    <ShieldCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                                    <span className="text-xs font-bold text-stone-700">BIS Hallmarked Jewelry</span>
                                </div>
                                <SpecRow label="Hallmark Number" value={product.bisHallmarkNumber} />
                                <SpecRow label="Certificate Detail" value={product.certificateDetails} />
                            </div>
                        </div>
                    </div>
                )}

                {/* COLUMN 3: Cost Breakdown Ledgers */}
                <div className={`${hasCert ? 'lg:col-span-3' : 'lg:col-span-4'} flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-200/60 pt-6 lg:pt-0 lg:pl-8`}>
                    <div>
                        <h3 className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#B76E79] mb-5">
                            Cost Breakdown
                        </h3>
                        <div className="bg-stone-50/70 rounded-2xl p-5 border border-stone-200/40">
                            {(() => {
                                if (!priceBreakdown) {
                                    return <p className="text-xs text-stone-400 text-center py-4">Pricing data loading...</p>;
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
                                    <>
                                        <SpecRow 
                                            label="Total Metal Value" 
                                            value={formatVal(metalValue)} 
                                        />
                                        <SpecRow 
                                            label={product.makingChargeType === "percentage" 
                                                ? `Making Charges (${product.makingChargeValue}%)` 
                                                : `Making Charges (${symbol}${makingChargeValDisp}/g)`} 
                                            value={formatVal(makingCharge)} 
                                        />
                                        <SpecRow 
                                            label={`CGST (${cgstRate}%)`} 
                                            value={formatVal(cgstAmount)} 
                                        />
                                        <SpecRow 
                                            label={`SGST (${sgstRate}%)`} 
                                            value={formatVal(sgstAmount)} 
                                        />
                                        
                                        <div className="border-t border-stone-200/60 pt-3 mt-3 space-y-1">
                                            <div className="flex justify-between items-baseline text-stone-600">
                                                <span className="text-sm">Original Amount</span>
                                                <span className="text-sm font-semibold text-stone-800">
                                                    {formatVal(originalPrice)}
                                                </span>
                                            </div>
                                            
                                            {discountPercentage > 0 && (
                                                <div className="flex justify-between items-baseline text-[#B76E79]">
                                                     <span className="text-sm">Discount (-{discountPercentage}%)</span>
                                                     <span className="text-sm font-semibold">
                                                         -{formatVal(originalPrice - salePrice)}
                                                     </span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-baseline font-bold text-stone-900 border-t border-stone-100 pt-2 mt-2">
                                                <span className="text-sm">Final Amount</span>
                                                <span className="text-lg text-stone-900">
                                                    {formatVal(salePrice)}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}