import React from 'react';
import { Gem, ShieldCheck, Award } from 'lucide-react';

function CertifiedJewellery() {
  return (
    <section className="py-20 px-4 bg-[#FDF8F3]">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B76E79] font-bold block mb-2">
              Certified Excellence
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#2C2C2C] tracking-wide mb-6">
              Hallmarked & Certified Jewellery
            </h2>
            <p className="text-sm md:text-base text-stone-600 mb-8 leading-relaxed">
              Every piece from our atelier is a symbol of trust. With BIS hallmarks for gold and internationally certified diamonds, 
              you can be confident in the quality and authenticity of your jewellery.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 bg-[#FFF0EB] rounded-full">
                  <ShieldCheck className="w-6 h-6 text-[#B76E79]" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#2C2C2C] mb-2">
                    BIS Hallmarked
                  </h4>
                  <p className="text-sm text-stone-600">
                    Guaranteeing the purity of your gold jewellery.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 bg-[#FFF0EB] rounded-full">
                  <Gem className="w-6 h-6 text-[#B76E79]" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#2C2C2C] mb-2">
                    Certified Diamonds
                  </h4>
                  <p className="text-sm text-stone-600">
                    Internationally certified diamonds with full disclosure of 4Cs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="mt-1 p-3 bg-[#FFF0EB] rounded-full">
                  <Award className="w-6 h-6 text-[#B76E79]" />
                </div>
                <div>
                  <h4 className="font-serif text-xl text-[#2C2C2C] mb-2">
                    Trusted Quality
                  </h4>
                  <p className="text-sm text-stone-600">
                    Rigorous quality checks ensure you receive only the finest pieces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-[#E8C7B7]/30 rounded-[3rem]" />
              <img 
                src="https://i.pinimg.com/736x/4e/22/bc/4e22bc1de0f601d2735697245a92f774.jpg" 
                alt="Certified Fine Jewellery" 
                className="rounded-[2.5rem] shadow-[0_30px_60px_rgba(44,44,44,0.06)] w-full h-auto"
                width="500"
                height="600"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CertifiedJewellery;