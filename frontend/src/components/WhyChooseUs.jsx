import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  RefreshCw, 
  Heart, 
  Gem, 
  Truck, 
  CheckCircle2 
} from 'lucide-react';

function WhyChooseUs() {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-[#B76E79]" />,
      title: "BIS Hallmarked",
      description: "All our gold jewellery is BIS hallmarked, guaranteeing purity and quality."
    },
    {
      icon: <Award className="w-10 h-10 text-[#B76E79]" />,
      title: "Certified Diamonds",
      description: "Every diamond comes with an internationally recognized certificate of authenticity."
    },
    {
      icon: <RefreshCw className="w-10 h-10 text-[#B76E79]" />,
      title: "Lifetime Exchange",
      description: "Exchange your jewellery for a lifetime with our flexible exchange policy."
    },
    {
      icon: <Heart className="w-10 h-10 text-[#B76E79]" />,
      title: "Buyback Guarantee",
      description: "Get the best value for your jewellery with our transparent buyback program."
    },
    {
      icon: <Gem className="w-10 h-10 text-[#B76E79]" />,
      title: "Premium Gemstones",
      description: "Handpicked, certified natural gemstones of the highest quality."
    },
    {
      icon: <Truck className="w-10 h-10 text-[#B76E79]" />,
      title: "Secure Delivery",
      description: "Fully insured, secure delivery with real-time tracking."
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#FDF8F3]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#B76E79] font-bold block mb-2">
            Why Choose Us
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-[#2C2C2C] tracking-wide mb-4">
            The Atelier Promise
          </h2>
          <p className="text-sm md:text-base text-stone-600 max-w-2xl mx-auto">
            From certified diamonds to lifetime service, discover what makes us your trusted destination for fine jewellery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white/60 backdrop-blur-md p-8 rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-6">
                {feature.icon}
              </div>
              <h3 className="font-serif text-xl text-[#2C2C2C] mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;