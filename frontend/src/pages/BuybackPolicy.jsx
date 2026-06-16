import React from 'react';

function BuybackPolicy() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-8">
            Buyback Policy
          </h1>

          <div className="space-y-8">
            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Our Buyback Promise
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                We stand by the value of our jewellery and offer a transparent buyback program for eligible items purchased from our atelier.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Eligibility
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                All our gold, diamond, platinum, and gemstone jewellery marked as "Buyback Eligible" can be sold back to us at the prevailing market rates of the precious metal, plus a portion of the making charges, if applicable.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                How It Works
              </h2>
              <ol className="text-sm md:text-base leading-relaxed text-stone-700 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">1.</span>
                  <span>Visit our store or contact customer care to initiate a buyback request.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">2.</span>
                  <span>Bring the original invoice, certificates, and the jewellery piece.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">3.</span>
                  <span>Our experts will verify the authenticity and weight of the jewellery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">4.</span>
                  <span>Receive instant payment based on the current market rate.</span>
                </li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuybackPolicy;