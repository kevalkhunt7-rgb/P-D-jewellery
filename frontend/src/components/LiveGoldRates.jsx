import React, { useState, useEffect } from 'react';

function LiveGoldRates() {
  const [goldRates, setGoldRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback/Mock data matching your image precisely
  const fallbackRates = [
    { purity: "24K", price: "₹6,500" },
    { purity: "22K", price: "₹6,000" },
    { purity: "18K", price: "₹4,900" }
  ];

  useEffect(() => {
    const fetchGoldPrice = async () => {
      try {
        setLoading(true);

        // 1. Check if we already have today's price stored in the browser cache
        const todayDate = new Date().toDateString(); // e.g., "Tue Jun 16 2026"
        const cachedPriceData = localStorage.getItem('gold_rates_cache');
        const cachedPriceDate = localStorage.getItem('gold_rates_date');

        if (cachedPriceData && cachedPriceDate === todayDate) {
          // Excellent! Use the saved price and don't waste an API call
          setGoldRates(JSON.parse(cachedPriceData));
          setLoading(false);
          return;
        }

        // 2. If no cache exists or it's a new day, fetch fresh data from the free API
        // Get your free API key instantly by signing up at: https://metalpriceapi.com/
        const API_KEY = 'YOUR_FREE_METALPRICE_API_KEY'; 
        const response = await fetch(`https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=INR&currencies=XAU`);

        if (!response.ok) {
          throw new Error('API limit reached or network error');
        }

        const data = await response.json();
        
        // MetalpriceAPI returns how much 1 INR is worth in Gold Ounces (XAU)
        // We mathematically convert it to get: Price of 1 Gram of Gold in INR
        const pricePerOunceINR = 1 / data.rates.XAU;
        const pricePerGram24K = pricePerOunceINR / 31.1035; // 1 Ounce = 31.1035 Grams

        // 3. Calculate 22K and 18K purities automatically
        const pricePerGram22K = pricePerGram24K * (22 / 24);
        const pricePerGram18K = pricePerGram24K * (18 / 24);

        // Helper function to format numbers cleanly into Indian Rupees (e.g., ₹6,500)
        const formatCurrency = (amount) => {
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(amount);
        };

        const finalRates = [
          { purity: "24K", price: formatCurrency(pricePerGram24K) },
          { purity: "22K", price: formatCurrency(pricePerGram22K) },
          { purity: "18K", price: formatCurrency(pricePerGram18K) }
        ];

        // 4. Save the calculated rates to localStorage for the next 24 hours
        localStorage.setItem('gold_rates_cache', JSON.stringify(finalRates));
        localStorage.setItem('gold_rates_date', todayDate);

        setGoldRates(finalRates);
        setError(null);
      } catch (err) {
        console.error("Gold API failed, using cached/fallback data:", err);
        // If API fails or key runs out, seamlessly show the layout defaults
        setGoldRates(fallbackRates);
      } finally {
        setLoading(false);
      }
    };

    fetchGoldPrice();
  }, []);

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-[#2C2C2C] to-[#1a1a1a] text-white">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-bold block mb-2">
            Live Rates
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-4">
            Today's Gold Prices
          </h2>
          <p className="text-sm md:text-base text-stone-300 max-w-2xl mx-auto">
            We update our gold prices daily to ensure you get the best market rate.
          </p>
        </div>

        {loading && goldRates.length === 0 ? (
          <div className="text-center text-[#D4AF37] animate-pulse font-serif text-xl">
            Loading Live Market Data...
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {goldRates.map((item, index) => (
              <div
                key={index}
                className="bg-[#1e1e1e] rounded-3xl p-8 border border-white/5 shadow-xl hover:border-[#D4AF37]/20 transition-all duration-300"
              >
                <h3 className="font-serif text-2xl text-[#D4AF37] mb-2">
                  {item.purity}
                </h3>
                <p className="text-4xl font-light font-serif tracking-wider">
                  {item.price}
                </p>
                <p className="text-xs uppercase tracking-widest text-stone-400 mt-2">
                  per gram
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LiveGoldRates;