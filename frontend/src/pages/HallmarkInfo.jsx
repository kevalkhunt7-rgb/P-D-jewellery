import React from 'react';

function HallmarkInfo() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide mb-8">
            BIS Hallmark Information
          </h1>

          <div className="space-y-8">
            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                What is BIS Hallmark?
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                The Bureau of Indian Standards (BIS) Hallmark is a certification that ensures the purity of gold and silver jewellery sold in India. 
                It guarantees that the precious metal content in your jewellery meets the standards set by BIS.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Hallmark Components
              </h2>
              <ul className="text-sm md:text-base leading-relaxed text-stone-700 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span><strong>BIS Logo:</strong> Official mark of the Bureau of Indian Standards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span><strong>Purity:</strong> 916 (22K), 750 (18K), 585 (14K), etc.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span><strong>Assaying & Hallmarking Center:</strong> The certified center's mark</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span><strong>Jeweler's Mark:</strong> Unique mark of the registered jeweler</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Our Hallmark Guarantee
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                Every gold and silver piece from our atelier comes with a BIS Hallmark, ensuring you receive jewellery of the highest purity and quality.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HallmarkInfo;