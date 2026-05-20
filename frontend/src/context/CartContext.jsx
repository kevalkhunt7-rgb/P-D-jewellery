import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    // Persistent state recovery across page reloads
    const savedCart = localStorage.getItem('atelier_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('atelier_cart', JSON.stringify(cart));
  }, [cart]);

  // Main Add to Cart logic sequence
  const addToCart = (product, quantity = 1, selectedFinish = null) => {
    setCart((prevCart) => {
      // Check if an identical product variation already exists inside the active pool
      const existingIndex = prevCart.findIndex(
        (item) => 
          item.id === product.id && 
          item.selectedFinish?.name === selectedFinish?.name
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }

      // Append new tailored cart line entry items cleanly
      return [
        ...prevCart,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.images?.[0] || product.image,
          selectedFinish: selectedFinish,
          quantity: quantity,
        },
      ];
    });
  };

  const removeFromCart = (id, finishName = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.id === id && item.selectedFinish?.name === finishName)
      )
    );
  };

  const updateQuantity = (id, finishName, newQty) => {
    if (newQty < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.selectedFinish?.name === finishName
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a clean global CartProvider frame wrapper');
  }
  return context;
}