import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import Home from './pages/Home'
import { AdminLayout } from './components/Layout'
import { Products } from './pages/Product'
import { Categories } from './pages/Categories'
import { EditCategory } from './pages/EditCategory'
import { Orders } from './pages/Orders'
import { Customers } from './pages/Customers'
import { Coupons } from './pages/Coupons'
import { Reviews } from './pages/Reviews'
import { Banners } from './pages/Banners'
import { Settings } from './pages/Settings'
import { EditBanner } from './pages/EditBanner'
import { Inventory } from './pages/Inventory'
import { Analytics } from './pages/Analytics'
import { AddProduct } from './pages/AddProduct'
import { ProductDetails } from './pages/ProductDetails'
import { EditProduct } from './pages/EditProduct'
import { OrderDetails } from './pages/OrderDetails'
import { CreateBanner } from './pages/CreateBanner'
import { CreateCoupon } from './pages/CreateCoupons'
import { EditCoupon } from './pages/EditCoupon'
import { CustomerProfile } from './pages/CustomberDetails'
import { AdminLogin } from './pages/AdminLogin'
import {NotFound} from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
      
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
        
        
        <Route index element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/edit-category/:id" element={<EditCategory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/coupons" element={<Coupons />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/edit-banner/:id" element={<EditBanner />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/product-details/:id" element={<ProductDetails />} />
        <Route path="/edit-product/:id" element={<EditProduct />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/create-banner" element={<CreateBanner />} />
        <Route path="/create-coupon" element={<CreateCoupon />} />
        <Route path="/edit-coupon/:id" element={<EditCoupon />} />
        <Route path="/customers/:id" element={<CustomerProfile />} />
        <Route path="/*" element={<NotFound />} />
        
        
        </Route>
      </Route>
      <Route path="/login" element={<AdminLogin />}/>
    </Routes>
    </AuthProvider>
  )
}

export default App