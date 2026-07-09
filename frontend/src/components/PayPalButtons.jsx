import React, { useState } from 'react';
import { PayPalButtons as PayPalSDKButtons } from "@paypal/react-paypal-js";

const PayPalButtons = ({ onCreateOrder, onApprove, onError }) => {
  const [isPending, setIsPending] = useState(true);

  return (
    <div className="relative w-full min-h-[150px]">
      {/* 1. ELEGANT SKELETON LOADING STATE */}
      {isPending && (
        <div className="absolute inset-0 flex flex-col space-y-3 w-full animate-pulse z-10 bg-[#FDFCFB]">
          <div className="h-11 bg-amber-400/20 rounded-full w-full" />
          <div className="h-11 bg-blue-600/10 rounded-full w-full" />
          <div className="h-4 bg-stone-200 rounded w-1/3 mx-auto mt-2" />
        </div>
      )}

      {/* 2. STATE-MANAGED PAYPAL BUTTON LAYER */}
      <PayPalSDKButtons
        style={{
          layout: "vertical",
          shape: "pill",
          label: "paypal",
          height: 44
        }}
        onInit={() => {
          // Removes loading overlay as soon as buttons render completely
          setIsPending(false); 
        }}
        createOrder={onCreateOrder}
        onApprove={onApprove}
        onError={(err) => {
          console.error('PayPal core SDK error:', err);
          onError(err);
        }}
      />
    </div>
  );
};

export default PayPalButtons;