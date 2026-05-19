import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';


export function BridalShowcase() {
    return (
        <section className="py-20 bg-gradient-to-br from-[#FFE5E8] via-[#FAF9F6] to-[#F7E7CE] overflow-hidden" id="bridal">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    {/* Image Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="relative"
                    >
                        <div className="relative rounded-3xl overflow-hidden">
                            {/* Decorative glow */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#B76E79]/20 to-[#D4AF37]/20 blur-3xl" />

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ duration: 0.5 }}
                                className="relative z-10"
                            >
                {/* // Replace the <ImageWithFallback /> section in your BridalShowcase with this: */}
                                <img
                                    src="https://images.unsplash.com/photo-1481980235850-66e47651e431?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBqZXdlbHJ5JTIwd2VkZGluZ3xlbnwxfHx8fDE3NzkxNjY2NDN8MA&ixlib=rb-4.1.0&q=80&w=1080"
                                    alt="Bridal jewelry collection"
                                    className="w-full h-auto rounded-3xl shadow-2xl"
                                    style={{ display: 'block', width: '100%', height: 'auto' }}
                                />
                            </motion.div>

                            {/* Floating decorative elements */}
                            <motion.div
                                animate={{
                                    y: [0, -20, 0],
                                    rotate: [0, 5, 0],
                                }}
                                transition={{
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="absolute top-8 right-8 w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl"
                            >
                                <Heart className="w-8 h-8 text-[#B76E79]" fill="#B76E79" />
                            </motion.div>

                            <motion.div
                                animate={{
                                    y: [0, 20, 0],
                                    rotate: [0, -5, 0],
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="absolute bottom-8 left-8 w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl"
                            >
                                <Sparkles className="w-10 h-10 text-[#D4AF37]" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Content Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        className="space-y-6"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-2 rounded-full bg-white/70 backdrop-blur-sm"
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#B76E79',
                                letterSpacing: '0.1em',
                            }}
                        >
                            BRIDAL COLLECTION
                        </motion.span>

                        <h2
                            className="font-serif"
                            style={{
                                fontSize: 'clamp(2rem, 5vw, 4rem)',
                                fontWeight: 700,
                                lineHeight: 1.2,
                                color: '#2C2C2C',
                            }}
                        >
                            Make Your Special Day{' '}
                            <span
                                style={{
                                    background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Unforgettable
                            </span>
                        </h2>

                        <p
                            style={{
                                fontSize: '1.125rem',
                                lineHeight: 1.8,
                                color: '#2C2C2C',
                                opacity: 0.8,
                            }}
                        >
                            Our exclusive bridal collection features handcrafted pieces designed to complement
                            every bride's unique style. From delicate necklaces to statement earrings, each piece
                            is created to make you shine on your most special day.
                        </p>

                        {/* Features */}
                        <div className="space-y-4 pt-4">
                            {[
                                { title: 'Customizable Designs', desc: 'Personalize your jewelry to match your vision' },
                                { title: 'Premium Quality', desc: 'Crafted with the finest materials' },
                                { title: 'Lifetime Warranty', desc: 'Protected for all your precious moments' },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: index * 0.2 }}
                                    className="flex items-start gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#B76E79] to-[#D4AF37] flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4
                                            className="font-medium mb-1"
                                            style={{
                                                fontSize: '1.125rem',
                                                color: '#2C2C2C',
                                            }}
                                        >
                                            {feature.title}
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: '0.875rem',
                                                color: '#2C2C2C',
                                                opacity: 0.7,
                                            }}
                                        >
                                            {feature.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-wrap gap-4 pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(183, 110, 121, 0.3)' }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-full font-medium tracking-wide"
                                style={{
                                    background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 100%)',
                                    color: 'white',
                                    fontSize: '1rem',
                                }}
                            >
                                Explore Bridal Collection
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 rounded-full font-medium tracking-wide bg-white hover:bg-[#FAF9F6] transition-all duration-300"
                                style={{
                                    color: '#B76E79',
                                    fontSize: '1rem',
                                    border: '2px solid #B76E79',
                                }}
                            >
                                Book Consultation
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}