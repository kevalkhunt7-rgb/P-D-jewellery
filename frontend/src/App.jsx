import './index.css'
import Navbar from "./components/Navbar"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import Login from './pages/Login'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import AboutPage from './pages/About'

function App() {
  return (

    <div className="w-full min-h-screen overflow-x-hidden bg-[#FAF9F6] relative">
     
        <Navbar />
       
        <main className="pt-16 w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
   
    </div>
  )
}

export default App