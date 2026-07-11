export const calculatePriceBreakdown = ({
  metalType = "GOLD",
  goldRate24kt,
  dailySilverRate999 = 0,
  purity,
  netWeight,
  makingChargeType,
  makingChargeValue,
  extraCharges = 0,
  cgstRate = 1.5,
  sgstRate = 1.5,
  discountPercentage = 0,
}) => {
  const purityMultiplier = {
    // Gold Purities
    "24KT": 1.000,
    "22KT": 0.920,
    "18KT": 0.760,
    "14KT": 0.595,
    "9KT":  0.405,
    
    // Silver Purities
    "999 Fine": 1.000,
    "958": 0.958,
    "925 Sterling": 0.925,
    "925": 0.925,
    "900": 0.900,
    "835": 0.835,
    "800": 0.800,
    
    // Platinum Purities & generic numeric keys
    "950 Platinum": 0.950,
    "950": 0.950,
    "999 Platinum": 0.999,
    "999": 0.999,
  };

  // Safe fallback to 1.0 if not mapped
  const multiplier = purityMultiplier[purity] !== undefined ? purityMultiplier[purity] : 1.000;

  // Resolve base metal rate
  const isSilver = metalType && metalType.toUpperCase() === "SILVER";
  const activeRate = isSilver ? dailySilverRate999 : goldRate24kt;

  // 1. Base Metal Rate per Gram (rounded to 2 decimals)
  const baseMetalRate = Number((activeRate * multiplier).toFixed(2));

  // 2. Total Metal Value (rounded to 2 decimals)
  const metalValue = Number((netWeight * baseMetalRate).toFixed(2));

  // 3. Making Charge (Labour) (rounded to 2 decimals)
  let makingCharge = 0;
  if (makingChargeType === "per_gram") {
    makingCharge = Number((netWeight * makingChargeValue).toFixed(2));
  } else if (makingChargeType === "percentage") {
    makingCharge = Number((metalValue * (makingChargeValue / 100)).toFixed(2));
  }

  // 4. Combined Subtotal (rounded to 2 decimals)
  const extraChargesTotal = Array.isArray(extraCharges)
    ? extraCharges.reduce((sum, item) => sum + (Number(item?.value) || 0), 0)
    : (Number(extraCharges) || 0);

  const combinedSubtotal = Number((metalValue + extraChargesTotal + makingCharge).toFixed(2));

  // 5. CGST and SGST Calculations (rounded to 2 decimals)
  const cgstValue = Number((combinedSubtotal * (cgstRate / 100)).toFixed(2));
  const sgstValue = Number((combinedSubtotal * (sgstRate / 100)).toFixed(2));

  // 6. Original Price (rounded to 2 decimals)
  const originalPrice = Number((combinedSubtotal + cgstValue + sgstValue).toFixed(2));

  // 7. Sale Price (rounded to 2 decimals)
  const salePrice = Number((originalPrice * (1 - (discountPercentage / 100))).toFixed(2));

  return {
    metalValue,
    extraCharges: extraChargesTotal,
    makingCharge,
    cgst: cgstValue,
    sgst: sgstValue,
    originalPrice,
    salePrice,
    discountPercentage: Number(discountPercentage)
  };
};
