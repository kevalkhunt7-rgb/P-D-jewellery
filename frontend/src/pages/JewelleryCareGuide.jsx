import React from 'react';

function JewelleryCareGuide() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-wide mb-8">
            Jewellery Care Guide
          </h1>

          <div className="space-y-8">
            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                General Care Tips
              </h2>
              <ul className="text-sm md:text-base leading-relaxed text-stone-700 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Store jewellery in a soft pouch or jewellery box to prevent scratches.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Keep jewellery away from harsh chemicals like perfumes, hairsprays, and cleaning agents.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Remove jewellery when swimming, showering, or exercising.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#D4AF37] flex-shrink-0" />
                  <span>Clean your jewellery regularly with a soft cloth to maintain its shine.</span>
                </li>
              </ul>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Gold Care
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                Clean gold jewellery with mild soap and warm water. Use a soft brush to gently clean hard-to-reach areas. 
                Pat dry with a soft cloth. Avoid using abrasive materials that may scratch the surface.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Diamond & Gemstone Care
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                Diamonds can be cleaned with a soft brush and mild soap. Gemstones should be handled with care, 
                as some may be sensitive to heat or chemicals. Always store gemstone jewellery separately to avoid scratches.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-4 text-[#B76E79]">
                Platinum Care
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                Platinum is a durable metal, but it can develop a patina over time. Clean with a soft cloth or use a 
                professional jewellery cleaner. For a high polish, visit our store for professional cleaning.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JewelleryCareGuide;