import './index.css'
import Navbar from "./components/Navbar"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from './pages/Login'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import AboutPage from './pages/About'
import ProductDetailPage from './pages/Product-detail'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import PremiumCheckoutPage from './pages/Checkout'
import CollectionsPage from './pages/Collections'

function App() {
  return (

    <div className="w-full min-h-screen overflow-x-hidden bg-[#FAF9F6] relative">
      <WishlistProvider>
        <CartProvider>
          <Navbar />

          <main className="pt-16 w-full overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path='/product/:id' element={<ProductDetailPage />} />
              <Route path='checkout' element={<PremiumCheckoutPage/>} />  
              <Route path='/collections' element={<CollectionsPage/>} />
            </Routes>
          </main>
        </CartProvider>
      </WishlistProvider>
    </div>
  )
}

export default App