import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const navigate = useNavigate(); // 2. Initialize the navigation hook

  // Fetch cart from backend if user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          const { data } = await api.get('/cart/my-cart');
          if (data.success && data.cart) {
            setCart(
              data.cart.cartItems
                .filter(item => item.product)
                .map(item => ({
                  id: item.product._id,
                  title: item.name || item.product.name,
                  price: item.price,
                  image:
                    item.image ||
                    item.product?.images?.[0]?.url ||
                    "",
                  quantity: item.quantity,
                  stock: item.stock,
                  selectedFinish: item.selectedFinish || null,
                }))
            );
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        }
      } else {
        const savedCart = localStorage.getItem('atelier_cart');
        setCart(savedCart ? JSON.parse(savedCart) : []);
      }
    };
    fetchCart();
  }, [user]);

  // Sync local storage if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('atelier_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = async (
    product,
    quantity = 1,
    selectedFinish = null
  ) => {
    // 3. AUTH GUARD: Check if user is logged out
    if (!user) {
      toast.error("Please sign in to add items to your cart");
      
      // Redirect to login page and preserve the current path so they can return seamlessly
      navigate('/login', { state: { from: window.location.pathname } });
      return; // Break execution to avoid making an unauthenticated API call
    }

    try {
      const payload = {
        productId: product._id || product.id,
        quantity,
      };

      const { data } = await api.post(
        '/cart/add',
        payload
      );

      if (data.success) {
        const newItem = {
          id: product._id || product.id,
          title: product.name || product.title,
          price: product.price,
          image:
            product.images?.[0]?.url ||
            product.image ||
            "",
          quantity,
          stock: product.stock,
          selectedFinish,
        };

        setCart((prevCart) => {
          const existingItem = prevCart.find(
            (item) =>
              item.id === newItem.id &&
              item.selectedFinish?.name ===
                selectedFinish?.name
          );

          let updatedCart;

          if (existingItem) {
            updatedCart = prevCart.map((item) =>
              item.id === newItem.id &&
              item.selectedFinish?.name ===
                selectedFinish?.name
                ? {
                    ...item,
                    quantity:
                      item.quantity + quantity,
                  }
                : item
            );
          } else {
            updatedCart = [
              ...prevCart,
              newItem,
            ];
          }

          // sync localStorage for guest users (Fallback safety)
          if (!user) {
            localStorage.setItem(
              'atelier_cart',
              JSON.stringify(updatedCart)
            );
          }

          return updatedCart;
        });

        toast.success("Added to cart");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add to cart");
    }
  };

  const removeFromCart = async (id, finishName = null) => {
    if (user) {
      try {
        const { data } = await api.delete(`/cart/remove/${id}`);
        if (data.success) {
          setCart(prev => prev.filter(item => item.id !== id));
        }
      } catch (error) {
        toast.error('Failed to remove item');
      }
    } else {
      setCart((prevCart) =>
        prevCart.filter((item) => !(item.id === id && item.selectedFinish?.name === finishName))
      );
    }
  };

  const updateQuantity = async (id, finishName, newQty) => {
    if (newQty < 1) return;
    if (user) {
      try {
        const { data } = await api.put(`/cart/update/${id}`, { quantity: newQty });
        if (data.success) {
          setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
        }
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === id && item.selectedFinish?.name === finishName
            ? { ...item, quantity: newQty }
            : item
        )
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      try {
        const { data } = await api.delete('/cart/clear');
        if (data.success) {
          setCart([]);
        }
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
        setCart([]);
      }
    } else {
      setCart([]);
      localStorage.removeItem('atelier_cart');
    }
  };

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
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}