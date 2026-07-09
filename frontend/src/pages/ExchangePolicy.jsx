import React from 'react';

function ExchangePolicy() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide mb-8">
            Exchange Policy
          </h1>

          <div className="space-y-8">
            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Our Exchange Promise
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                We want you to be completely satisfied with your purchase. If for any reason you are not, 
                we offer a flexible exchange policy to ensure your happiness.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Exchange Eligibility
              </h2>
              <ul className="text-sm md:text-base leading-relaxed text-stone-700 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Exchange requests must be made within 30 days of purchase.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Jewellery must be unused, in original condition, with all tags and certificates intact.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Original invoice must be presented at the time of exchange.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                How to Exchange
              </h2>
              <ol className="text-sm md:text-base leading-relaxed text-stone-700 space-y-3">
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">1.</span>
                  <span>Visit our store or contact customer care to initiate an exchange.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">2.</span>
                  <span>Select a new piece of jewellery of equal or higher value.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="font-bold text-[#B76E79]">3.</span>
                  <span>Pay the difference in price, if any.</span>
                </li>
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExchangePolicy;