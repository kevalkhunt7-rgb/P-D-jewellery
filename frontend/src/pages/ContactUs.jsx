import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Loader2, Sparkles, ArrowRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../context/SettingsContext";
import api from "../utils/api";
import toast from "react-hot-toast";
import { sanitizePhone, isValidPhone, PHONE_ERROR_MESSAGE } from "../utils/phoneValidation";
import contactImg from "../assets/contact.jpg";

/* ------------------------------------------------------------------ */
/* Motion helpers                                                     */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ */
/* Decorative SVG marks — small line-art gem/jewellery motifs        */
/* ------------------------------------------------------------------ */

const RingMark = ({ className = "", ...props }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} {...props}>
    <circle cx="24" cy="27" r="14" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M18 13 L24 4 L30 13"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path d="M24 4 L24 13" stroke="currentColor" strokeWidth="1" opacity="0.6" />
  </svg>
);

const SparkleDot = ({ style, reduced }) => {
  if (reduced) return null;
  return (
    <motion.span
      className="absolute text-[#D4AF37]"
      style={style}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
      transition={{
        duration: 2.8 + Math.random() * 2,
        repeat: Infinity,
        delay: Math.random() * 3,
        ease: "easeInOut",
      }}
    >
      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
    </motion.span>
  );
};

/* Signature element — the gem is drawn facet by facet, then holds a slow
   internal glint. Ties the "cut" motif directly to the jeweller's craft
   rather than decorating the page with an unrelated flourish. */
const SignatureGem = ({ reduced, className = "" }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.18, duration: 1.1, ease: [0.65, 0, 0.35, 1] },
        opacity: { delay: i * 0.18, duration: 0.25 },
      },
    }),
  };

  return (
    <motion.svg
      viewBox="0 0 200 190"
      className={className}
      initial={reduced ? "show" : "hidden"}
      animate="show"
    >
      <motion.path d="M38 66 L100 14 L162 66 L100 178 Z" fill="none" stroke="#D4AF37" strokeWidth="1.3" variants={draw} custom={0} />
      <motion.path d="M38 66 L162 66" stroke="#D4AF37" strokeWidth="1" opacity="0.55" variants={draw} custom={1} />
      <motion.path d="M69 66 L100 178" stroke="#D4AF37" strokeWidth="0.7" opacity="0.45" variants={draw} custom={2} />
      <motion.path d="M131 66 L100 178" stroke="#D4AF37" strokeWidth="0.7" opacity="0.45" variants={draw} custom={2} />
      <motion.path d="M100 14 L69 66" stroke="#D4AF37" strokeWidth="0.7" opacity="0.45" variants={draw} custom={3} />
      <motion.path d="M100 14 L131 66" stroke="#D4AF37" strokeWidth="0.7" opacity="0.45" variants={draw} custom={3} />
      {!reduced && (
        <motion.circle
          cx="100"
          cy="92"
          r="2.4"
          fill="#D4AF37"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ delay: 1.9, duration: 2.2, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
        />
      )}
    </motion.svg>
  );
};

/* ------------------------------------------------------------------ */
/* Floating-label field — animates the label out of the way instead   */
/* of relying on a static placeholder, and surfaces validity live.    */
/* ------------------------------------------------------------------ */

const FloatingField = ({
  id,
  label,
  required,
  type = "text",
  value,
  onChange,
  focusedField,
  setFocusedField,
  maxLength,
  valid,
}) => {
  const isFocused = focusedField === id;
  const hasValue = Boolean(value && value.length > 0);
  const lifted = isFocused || hasValue;

  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocusedField(id)}
        onBlur={() => setFocusedField(null)}
        required={required}
        maxLength={maxLength}
        className={`peer w-full bg-[#FCF8F4]/40 border rounded-xl px-4 pt-6 pb-2.5 text-sm text-[#2C2C2C] transition-all duration-300 ${
          isFocused ? "border-[#D4AF37] bg-white ring-4 ring-[#D4AF37]/5 outline-none" : "border-stone-200"
        }`}
      />
      <motion.label
        htmlFor={id}
        className="absolute left-4 pointer-events-none origin-left select-none"
        initial={false}
        animate={{
          top: lifted ? "0.6rem" : "50%",
          y: lifted ? 0 : "-50%",
          scale: lifted ? 0.72 : 1,
          color: isFocused ? "#D4AF37" : "#a8a29e",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {label} {required && <span className="text-[#B76E79]">*</span>}
      </motion.label>
      <AnimatePresence>
        {valid && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
          >
            <Check className="w-4 h-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ------------------------------------------------------------------ */

const containerStagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

function ContactUs() {
  const { settings } = useSettings();
  const reducedMotion = usePrefersReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const general = settings?.general || {};
  const storeName = general.storeName || "P&D Luxury Jewellery";
  const storeEmail = general.storeEmail || "support@pdluxuryjewellery.com";
  const storePhone = general.phone || "+91 98765 43210";
  const storeAddress = general.address || "123 Jewellery Street, Surat, Gujarat, India";

  const contactCards = [
    {
      icon: Mail,
      label: "Email Us",
      value: storeEmail,
      href: `mailto:${storeEmail}`,
    },
    {
      icon: Phone,
      label: "Call Us",
      value: storePhone,
      href: `tel:${storePhone.replace(/\s/g, "")}`,
    },
    {
      icon: MapPin,
      label: "Visit Us",
      value: storeAddress,
      href: "#",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon - Sat: 10:00 AM - 8:00 PM",
      href: "#",
    },
  ];

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const nameValid = formData.name.trim().length > 1;
  const phoneValid = formData.phone.length === 0 || isValidPhone(formData.phone);
  const subjectValid = formData.subject.trim().length > 2;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? sanitizePhone(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      return toast.error("Please fill in all required fields");
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      return toast.error(PHONE_ERROR_MESSAGE);
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post("/contact/submit", formData);
      if (data.success) {
        toast.success(data.message);
        setIsSent(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
        setTimeout(() => setIsSent(false), 5000);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error(error?.response?.data?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FCF8F4] text-[#2C2C2C] font-sans overflow-x-hidden antialiased">

      {/* 1. Hero Section */}
      <section className="relative bg-[#1F1F1F] py-24 sm:py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(183,110,121,0.05),transparent_50%)]" />

        {/* Ambient Sparkles */}
        <SparkleDot style={{ top: "15%", left: "10%" }} reduced={reducedMotion} />
        <SparkleDot style={{ top: "75%", left: "5%" }} reduced={reducedMotion} />
        <SparkleDot style={{ top: "25%", right: "8%" }} reduced={reducedMotion} />
        <SparkleDot style={{ top: "65%", right: "12%" }} reduced={reducedMotion} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <SignatureGem reduced={reducedMotion} className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6" />

          <motion.span
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-[10px] sm:text-xs uppercase text-[#D4AF37] font-semibold block mb-5"
          >
            Connoisseurs of Fine Craftsmanship
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05, ease: "easeOut" }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl text-white font-light tracking-wide leading-tight mb-8"
          >
            Connect With <br />
            <span className="italic text-[#D4AF37] font-normal font-serif">{storeName}</span>
            <span className="italic text-[#D4AF37] font-normal font-serif"> Luxury Jewellery</span>
          </motion.h1>

          <motion.div
            className="h-[1px] bg-[#D4AF37]/40 mx-auto mb-8"
            initial={{ width: 0 }}
            animate={{ width: 64 }}
            transition={{ duration: 0.7, delay: 1.3, ease: "easeOut" }}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="text-stone-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-light"
          >
            Whether discussing an heirloom restoration, custom gemstone curation, or boutique appointments, our specialists welcome your inquiry.
          </motion.p>
        </div>
      </section>

      {/* 2. Editorial Showcase & Split Form Section */}
      <section className="py-20 lg:py-28 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT: Premium Visual Showcase with Image */}
          <motion.div
            className="lg:col-span-5 lg:sticky lg:top-8 space-y-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* The Image Container */}
            <motion.div
              className="relative group p-3 bg-white border border-stone-200/60 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.03)]"
              animate={reducedMotion ? {} : { y: [0, -6, 0] }}
              transition={reducedMotion ? {} : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Decorative Frame */}
              <div className="absolute -inset-2 border border-[#D4AF37]/20 rounded-[2rem] pointer-events-none scale-95 group-hover:scale-100 transition-transform duration-700" />

              <div className="relative rounded-2xl overflow-hidden h-[400px] sm:h-[500px]">
                <img
                  src={contactImg}
                  alt={`${storeName} Luxury Luxury`}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/60 via-transparent to-transparent" />

                
              </div>
            </motion.div>

            {/* Micro details under photo */}
            <div className="border-l-2 border-[#D4AF37] pl-5 space-y-3">
              <h3 className="font-serif text-xl font-medium text-[#2C2C2C]">Bespoke Commissions</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-light">
                Collaborate remotely or in person with our Master Goldsmiths. We bring your vision to life from sketch to diamond setting.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: High-End Contact Form */}
          <motion.div
            className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_rgba(44,44,44,0.04)] border border-stone-100 relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-10">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B76E79] font-bold block mb-2">Electronic Salon</span>
              <h2 className="font-serif text-3xl font-bold tracking-tight text-[#2C2C2C]">Send An Inquiry</h2>
              <p className="text-stone-400 text-sm mt-1 font-light">Fields marked with an asterisk (*) are required.</p>
            </div>

            <AnimatePresence mode="wait">
              {isSent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center py-16"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </motion.div>
                  <h3 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Transmission Successful</h3>
                  <p className="text-stone-500 text-sm max-w-sm font-light leading-relaxed">
                    Thank you. Your message has been routed to our concierge desk. A liaison will respond within 24 business hours.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FloatingField
                      id="name"
                      label="Full Name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      valid={nameValid}
                    />
                    <FloatingField
                      id="email"
                      label="Email Address"
                      required
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      valid={formData.email.length > 0 && emailValid}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FloatingField
                      id="phone"
                      label="Phone Number"
                      type="tel"
                      maxLength={10}
                      value={formData.phone}
                      onChange={handleChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      valid={formData.phone.length === 10 && phoneValid}
                    />
                    <FloatingField
                      id="subject"
                      label="Inquiry Subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      focusedField={focusedField}
                      setFocusedField={setFocusedField}
                      valid={subjectValid}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                      Message Details <span className="text-[#B76E79]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Please delineate your specifications..."
                      rows={5}
                      required
                      className={`w-full bg-[#FCF8F4]/40 border rounded-xl px-4 py-3.5 text-sm text-[#2C2C2C] placeholder-stone-400 transition-all duration-300 resize-none ${
                        focusedField === "message" ? "border-[#D4AF37] bg-white ring-4 ring-[#D4AF37]/5 outline-none" : "border-stone-200"
                      }`}
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
                    className="relative w-full overflow-hidden inline-flex items-center justify-center gap-3 bg-[#1F1F1F] hover:bg-[#2C2C2C] disabled:bg-stone-400 text-white text-xs font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl mt-2"
                  >
                    {!reducedMotion && !isSubmitting && (
                      <motion.span
                        className="absolute inset-y-0 -left-1/4 w-1/4 bg-gradient-to-r from-transparent via-[#D4AF37]/25 to-transparent skew-x-12"
                        initial={{ x: "-120%" }}
                        animate={{ x: "520%" }}
                        transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 1.2, ease: "linear" }}
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-3">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-[#D4AF37]" />
                          Submit Secure Form
                        </>
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </section>

      {/* 3. Luxury Information Grid (Contact Cards) */}
      <div className="bg-[#1F1F1F] text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 translate-x-12 translate-y-12">
          <RingMark className="w-96 h-96" />
        </div>

        <motion.section
          className="max-w-7xl mx-auto"
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-semibold block mb-3">Channels of Access</span>
            <h2 className="font-serif text-3xl font-light tracking-wide">Direct Luxurys & Directories</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card) => (
              <motion.a
                key={card.label}
                href={card.href}
                variants={fadeUp}
                whileHover={reducedMotion ? {} : { y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="group relative bg-[#2A2A2A] border border-white/5 rounded-2xl p-8 hover:border-[#D4AF37]/30 hover:bg-[#323232] transition-colors duration-300 flex flex-col justify-between min-h-[180px]"
              >
                <div>
                  <motion.div
                    whileHover={reducedMotion ? {} : { rotate: 8, scale: 1.08 }}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-colors"
                  >
                    <card.icon className="w-4 h-4 text-[#D4AF37]" />
                  </motion.div>
                  <h3 className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-2">
                    {card.label}
                  </h3>
                  <p className="text-sm font-light text-white/90 leading-relaxed whitespace-pre-line">
                    {card.value}
                  </p>
                </div>

                {card.href !== "#" && (
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold tracking-wider text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Connect <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>

    </div>
  );
}

export default ContactUs;