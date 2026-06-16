import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import api from '../utils/api';

const ProductContext = createContext();

export const useProducts = () => {
  return useContext(ProductContext);
};

export const ProductProvider = ({ children }) => {

  // MASTER PRODUCTS
  const [products, setProducts] = useState([]);

  // SEARCH/FILTER PRODUCTS
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================
  // MAP PRODUCTS
  // =========================================

  const mapProducts = (fetchedProducts) => {
    return fetchedProducts.map((p) => {
      const sellingPrice = p.price;
      const originalPrice = p.originalPrice || (sellingPrice * 1.2);

      return {
        // Keep all original product data
        ...p,
        // Standard fields
        id: p._id,
        slug: p.slug,
        title: p.name,
        subtitle: p.category?.name || p.category || "Exclusive Atelier Edition",
        rating: p.ratings || p.defaultRating || 4.5,
        reviewsCount: p.numOfReviews || 0,
        price: sellingPrice,
        originalPrice,
        tag:
          p.isFeatured
            ? "FEATURED"
            : p.isTrending
              ? "TRENDING"
              : p.isNewArrival
                ? "NEW"
                : "",

        description: p.description || "",
        shortDesc: p.description
          ? p.description.substring(0, 100) + "..."
          : "",

        details: {
          material: p.material || "Premium Base Alloy",
          stones: p.stones || "Hand-set",
          weight: p.weight || "N/A",
          dimensions: p.dimensions || "N/A",
          packaging: "Signature Ivory velvet storage casket"
        },

        images:
          p.images?.length > 0
            ? p.images.map(img =>
              typeof img === 'string' ? img : img.url
            )
            : [
              "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000"
            ],

        category: p.category?.name || p.category,
        isFeatured: p.isFeatured,
        isNew: p.isNewArrival,
        isTrending: p.isTrending,
        occasion: p.occasion || [],
        tags: p.tags || [],
        status: p.status || "active",
        createdAt: p.createdAt
      };
    }).filter(p => p.status === "active");
  };

  // =========================================
  // FETCH ALL PRODUCTS
  // =========================================

  const fetchProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get('/products/get-products');

      let fetchedProducts =
        response.data.products || response.data;

      if (!Array.isArray(fetchedProducts)) {
        fetchedProducts = fetchedProducts.data || [];
      }

      const mappedProducts = mapProducts(fetchedProducts);

      // STORE MASTER PRODUCTS
      setProducts(mappedProducts);

      // RESET FILTERED PRODUCTS
      setFilteredProducts(mappedProducts);

      setLoading(false);

    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // =========================================
  // SEARCH PRODUCTS
  // =========================================

  const searchProducts = async (searchQuery = "") => {

    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    setLoading(true);

    try {

      const response = await api.get(
        `/products/get-products?search=${encodeURIComponent(searchQuery)}`
      );

      let fetchedProducts =
        response.data.products || response.data;

      if (!Array.isArray(fetchedProducts)) {
        fetchedProducts = fetchedProducts.data || [];
      }

      const mappedProducts = mapProducts(fetchedProducts);

      // ONLY UPDATE FILTERED PRODUCTS
      setFilteredProducts(mappedProducts);

      setLoading(false);

    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
      setLoading(false);
    }
  };

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

    // MASTER
    products,

    // SEARCH RESULTS
    filteredProducts,

    loading,
    error,

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