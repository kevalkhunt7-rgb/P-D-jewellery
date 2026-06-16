import React, { Suspense, lazy } from 'react'
import './index.css'
import Navbar from "./components/Navbar"
import { Routes, Route } from "react-router-dom"

// 1. Import your custom Jewelry Loader
import Loading from './components/Loading'

// Providers
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { ProductProvider } from './context/ProductContext'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

// Components
import ScrollToTop from './components/ScrollToTop'
import { Footer } from './components/Footer'
import OrderDetailPage from './pages/OrderDetailPage'

// 2. Change standard imports to Lazy Imports for smooth page transition loaders
const Home = lazy(() => import("./pages/Home"))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const Cart = lazy(() => import('./pages/Cart'))
const AboutPage = lazy(() => import('./pages/About'))
const ProductDetailPage = lazy(() => import('./pages/Product-detail'))
const PremiumCheckoutPage = lazy(() => import('./pages/Checkout'))
const CollectionsPage = lazy(() => import('./pages/Collections'))
const LookBookPage = lazy(() => import('./pages/Lookbook'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))
const GiveReview = lazy(() => import('./pages/GiveReview'))
const NewArrivalsPage = lazy(() => import('./pages/NewArrivals'))
const CertificationPolicy = lazy(() => import('./pages/CertificationPolicy'))
const HallmarkInfo = lazy(() => import('./pages/HallmarkInfo'))
const BuybackPolicy = lazy(() => import('./pages/BuybackPolicy'))
const ExchangePolicy = lazy(() => import('./pages/ExchangePolicy'))
const JewelleryCareGuide = lazy(() => import('./pages/JewelleryCareGuide'))

function App() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-[#FAF9F6] relative">
      <AuthProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <ProductProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />

              <main className="pt-16 w-full overflow-x-hidden">
                <ScrollToTop />
                
                {/* 3. Wrap your Routes in Suspense and pass your custom <Loading /> component */}
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path='/product/:slug' element={<ProductDetailPage />} />
                    <Route path='checkout' element={<PremiumCheckoutPage />} />
                    <Route path='/collections' element={<CollectionsPage />} />
                    <Route path='/lookbook' element={<LookBookPage />} />
                    <Route path='/give-review/:productId' element={<GiveReview />} />
                    <Route path='/new-arrivals' element={<NewArrivalsPage />} />
                    <Route path="/certification-policy" element={<CertificationPolicy />} />
                    <Route path="/hallmark-info" element={<HallmarkInfo />} />
                    <Route path="/buyback-policy" element={<BuybackPolicy />} />
                    <Route path="/exchange-policy" element={<ExchangePolicy />} />
                    <Route path="/jewellery-care-guide" element={<JewelleryCareGuide />} />
                    <Route path="/order-detail/:id" element={<OrderDetailPage />} />
                  
                    <Route path='/*' element={<NotFoundPage />} />
                  </Routes>
                </Suspense>

              </main>
             <Footer/> 
            
            </CartProvider>
          </WishlistProvider>
        </ProductProvider>
      </AuthProvider>
    </div>
  )
}

export default App