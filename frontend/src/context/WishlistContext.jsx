import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState(() => {
    // Persistent state recovery across page reloads
    const savedWishlist = localStorage.getItem('lumiere_wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  // Keep localStorage in sync with wishlist state changes
  useEffect(() => {
    localStorage.setItem('lumiere_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Toggle Item in Wishlist (Adds if missing, removes if already present)
  const toggleWishlist = (product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.some((item) => item.id === product.id);
      
      if (exists) {
        // Remove item if it's already there
        return prevWishlist.filter((item) => item.id !== product.id);
      } else {
        // Append new minimalist item payload
        return [
          ...prevWishlist,
          {
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            tag: product.tag || null
          },
        ];
      }
    });
  };

  // Explicit single-purpose actions if needed down-funnel
  const removeFromWishlist = (id) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.id === id);
  };

  const clearWishlist = () => setWishlist([]);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist,
        wishlistCount: wishlist.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside a clean global WishlistProvider frame wrapper');
  }
  return context;
}