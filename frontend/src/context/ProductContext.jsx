import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';
import { useLocation } from 'react-router-dom';

import api from '../utils/api';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {
  const location = useLocation();

  // Active country code resolved dynamically
  const [countryCode, setCountryCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("countryCode") || localStorage.getItem("countryCode") || "IN";
    localStorage.setItem("countryCode", code);
    return code;
  });

  // MASTER PRODUCTS
  const [products, setProducts] = useState([]);

  // SEARCH/FILTER PRODUCTS
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync React Router location search params with countryCode state
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("countryCode");
    if (codeFromUrl && codeFromUrl !== countryCode) {
      setCountryCode(codeFromUrl);
      localStorage.setItem("countryCode", codeFromUrl);
    }
  }, [location.search, countryCode]);

  // =========================================
  // MAP PRODUCTS (CLEAN VERSION)
  // =========================================

  const mapProducts = (fetchedProducts) => {
    return fetchedProducts
      .map((p) => {
        return {
          ...p,

          id: p._id,
          slug: p.slug,
          title: p.name,

          // IMPORTANT: DO NOT MODIFY PRICING HERE
          price: p.price,
          originalPrice: p.originalPrice,

          searchScore: p.searchScore || 0,

          category: p.category?.name || p.category,
          isFeatured: p.isFeatured,
          isNew: p.isNewArrival,
          isTrending: p.isTrending,
          occasion: p.occasion || [],
          tags: p.tags || [],
          status: p.status || "active",
          createdAt: p.createdAt
        };
      })
      .filter((p) => p.status === "active");
  };

  // =========================================
  // FETCH ALL PRODUCTS
  // =========================================

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get('/products/get-products', {
        params: { countryCode }
      });

      let fetchedProducts =
        response.data.products || response.data;

      if (!Array.isArray(fetchedProducts)) {
        fetchedProducts = fetchedProducts.data || [];
      }

      const mappedProducts = mapProducts(fetchedProducts);

      setProducts(mappedProducts);
      setFilteredProducts(mappedProducts);

      setLoading(false);

    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [countryCode]);

  // =========================================
  // SEARCH PRODUCTS
  // =========================================

  const searchProducts = useCallback(async (searchQuery = "") => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get('/products/get-products', {
        params: {
          search: searchQuery.trim(),
          countryCode
        }
      });

      let fetchedProducts =
        response.data.products || response.data;

      if (!Array.isArray(fetchedProducts)) {
        fetchedProducts = fetchedProducts.data || [];
      }

      const mappedProducts = mapProducts(fetchedProducts);

      setFilteredProducts(mappedProducts);
      setLoading(false);

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [products, countryCode]);

  // =========================================
  // RESET SEARCH
  // =========================================

  const resetProducts = () => {
    setFilteredProducts(products);
  };

  // =========================================
  // INITIAL FETCH
  // =========================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // =========================================
  // CONTEXT VALUE
  // =========================================

  const value = {
    products,
    filteredProducts,
    loading,
    error,
    countryCode,
    setCountryCode,

    fetchProducts,
    searchProducts,
    resetProducts,

    getFeaturedProducts: () =>
      products.filter(p => p.isFeatured),

    getTrendingProducts: () =>
      products.filter(p => p.isTrending),

    getLatestProducts: () =>
      [...products]
        .sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 6),

    getBestSellers: () =>
      products.slice(0, 8)
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};