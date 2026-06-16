import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Fetch wishlist from backend if user is logged in
  // Fetch wishlist from backend if user is logged in
useEffect(() => {
  const fetchWishlist = async () => {
    if (user) {
      try {
        const { data } = await api.get('/wishlist/my-wishlist');

        console.log("WISHLIST API RESPONSE:", data);

        if (data.success) {
          const mappedWishlist = (data.wishlist?.products || [])
            .filter(item => item?.product) // Skip deleted/missing products
            .map(item => ({
              id: item.product._id,
              title: item.product.name,
              price: item.product.price,
              image:
                item.product.images?.[0]?.url ||
                item.product.images?.[0] ||
                '',
              tag: item.product.isFeatured
                ? 'FEATURED'
                : item.product.isTrending
                ? 'TRENDING'
                : item.product.isNewArrival
                ? 'NEW'
                : '',
            }));

          setWishlist(mappedWishlist);
        }
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
        setWishlist([]);
      }
    } else {
      const savedWishlist = localStorage.getItem('lumiere_wishlist');
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    }
  };

  fetchWishlist();
}, [user]);
  // Sync local storage if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('lumiere_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const toggleWishlist = async (product) => {
    if (user) {
      const exists = wishlist.some((item) => item.id === product.id);
      if (exists) {
        try {
          const { data } = await api.delete(`/wishlist/remove/${product.id}`);
          if (data.success) {
            setWishlist(prev => prev.filter(item => item.id !== product.id));
            toast.success('Removed from wishlist');
          }
        } catch (error) {
          toast.error('Failed to remove from wishlist');
        }
      } else {
        try {
          const { data } = await api.post('/wishlist/add', { productId: product.id });
          if (data.success) {
            setWishlist(prev => [...prev, {
              id: product.id,
              title: product.title,
              price: product.price,
              image: product.image,
              tag: product.tag || null
            }]);
            toast.success('Added to wishlist');
          }
        } catch (error) {
          toast.error('Failed to add to wishlist');
        }
      }
    } else {
      setWishlist((prevWishlist) => {
        const exists = prevWishlist.some((item) => item.id === product.id);
        if (exists) {
          toast.success('Removed from wishlist');
          return prevWishlist.filter((item) => item.id !== product.id);
        } else {
          toast.success('Added to wishlist');
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
    }
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