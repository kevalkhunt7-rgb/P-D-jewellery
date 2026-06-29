import React, { useEffect, useRef } from 'react';
import api from '../utils/api';

const PayPalButtons = ({ amount, onSuccess, onError, currency = 'USD' }) => {
  const paypalRef = useRef(null);

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPal = async () => {
      try {
        const response = await api.get('/settings/public'); // This is just to get client ID? Or wait, let's get it from .env
        const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'; // We'll add this to .env
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=${currency}`;
        script.addEventListener('load', () => {
          if (window.paypal) {
            window.paypal.Buttons({
              createOrder: async (data, actions) => {
                try {
                  const response = await api.post('/payment/paypal/create-order', { amount });
                  if (response.data.success) {
                    return response.data.orderID;
                  }
                  throw new Error('Failed to create PayPal order');
                } catch (err) {
                  console.error('Create PayPal order error:', err);
                  onError(err);
                }
              },
              onApprove: async (data, actions) => {
                try {
                  const response = await api.post('/payment/paypal/capture-order', { orderID: data.orderID });
                  if (response.data.success) {
                    onSuccess({
                      paymentId: response.data.captureID,
                      paypalOrderId: data.orderID
                    });
                  } else {
                    throw new Error('Failed to capture PayPal order');
                  }
                } catch (err) {
                  console.error('Capture PayPal order error:', err);
                  onError(err);
                }
              },
              onError: (err) => {
                console.error('PayPal error:', err);
                onError(err);
              }
            }).render(paypalRef.current);
          }
        });
        document.body.appendChild(script);
      } catch (err) {
        console.error('Failed to load PayPal:', err);
        onError(err);
      }
    };

    loadPayPal();

    return () => {
      // Clean up script if needed
    };
  }, [amount, onSuccess, onError, currency]);

  return <div ref={paypalRef} className="w-full"></div>;
};

export default PayPalButtons;
