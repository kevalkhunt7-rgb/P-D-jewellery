import React from 'react';

function CertificationPolicy() {
  return (
    <div className="min-h-screen bg-[#FDF8F3] text-[#2C2C2C] font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-wide mb-8">
            Certification Policy
          </h1>

          <div className="space-y-8">
            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Our Certification Standards
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                At our atelier, every piece of fine jewellery comes with the assurance of authenticity. 
                We provide internationally recognized certifications for diamonds, gemstones, and precious metals.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Diamond Certifications
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700 mb-4">
                All our diamonds come with certifications from renowned gemological laboratories, verifying 
                the 4Cs (Carat, Color, Clarity, and Cut) and ensuring authenticity.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Gemstone Certifications
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                Precious and semi-precious gemstones are accompanied by certificates stating their origin, 
                treatment (if any), and quality parameters from trusted gemological institutes.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-stone-200/60 shadow-sm">
              <h2 className="font-serif text-2xl font-light mb-4 text-[#B76E79]">
                Hallmark Authentication
              </h2>
              <p className="text-sm md:text-base leading-relaxed text-stone-700">
                All our gold jewellery is BIS hallmarked, guaranteeing the purity of gold as per Indian standards.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificationPolicy;