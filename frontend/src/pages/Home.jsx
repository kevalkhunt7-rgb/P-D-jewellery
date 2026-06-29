import React from 'react'
import { Hero } from '../components/Hero'
import { FeaturedCollections } from '../components/FeaturedCollections'
import { BestSellers } from '../components/BestSeller'
import { BridalShowcase } from '../components/BridalShowcase'
import { PremiumBanner } from '../components/Banner'
import { AutoReviewSlider } from '../components/testimonials'
import { InstagramGallery } from '../components/InstaGallary'
import { Footer } from '../components/Footer'
import WhyChooseUs from '../components/WhyChooseUs'
import LiveGoldRates from '../components/LiveGoldRates'
import CertifiedJewellery from '../components/CertifiedJewellery'
import DiamondCollections from '../components/DiamondCollections'


const Home = () => {
    return (
        <div>
            <Hero />
            <CertifiedJewellery />
            <FeaturedCollections />
            {/* <LiveGoldRates /> */}
            <BestSellers />
            <DiamondCollections />
            <BridalShowcase />
            <WhyChooseUs />
            <PremiumBanner/>
            <AutoReviewSlider/>
            {/* <InstagramGallery/> */}
            
        </div>
    )
}

export default Home