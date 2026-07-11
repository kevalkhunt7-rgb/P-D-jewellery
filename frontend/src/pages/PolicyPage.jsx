import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, RefreshCcw, Truck, FileText, RotateCcw, XCircle, Cookie,
  BadgeCheck, CreditCard, Phone, ChevronDown, Search, Link2, Share2,
  Printer, ArrowUp, Sun, Moon, Menu, X, Clock, Info, AlertTriangle,
  Check, ChevronsDownUp, ChevronsUpDown, Home,
} from "lucide-react";

/* ================================================================== */
/* DATA — every policy lives here, rendered dynamically via map()     */
/* ================================================================== */

const policies = [
 {
  id: "privacy-policy",
  title: "Privacy Policy",
  icon: Shield,
  updated: "July 04, 2026",
  intro:
    "At P&D Luxury Jewellery, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and safeguard your personal information when you browse our website, create an account, or purchase our products.",

  bullets: [
    "We may collect personal information including your name, email address, phone number, billing and shipping addresses, account details, order history, and communication records to provide our services effectively.",

    "Payment transactions are securely processed through trusted third-party payment providers. P&D Luxury Jewellery does not store your complete credit card, debit card, CVV, or banking information on its servers.",

    "We use your information to process orders, arrange shipping, provide customer support, verify payments, prevent fraudulent activities, improve website performance, personalize your shopping experience, and send order updates or promotional communications where permitted.",

   

    "We may share your information only with trusted service providers such as payment gateways, courier partners, hosting providers, analytics platforms, and legal authorities when required to fulfill your orders or comply with applicable laws. We never sell or rent your personal information.",

    "We implement industry-standard security measures including SSL encryption, secure servers, and controlled system access to help protect your personal data against unauthorized access or misuse.",

  
  ]

 
},{
  id: "refund-policy",
  title: "Refund Policy",
  icon: RefreshCcw,
  updated: "July 04, 2026",
  intro:
    "Refunds are processed only for approved order cancellation requests. Once your cancellation request is reviewed and approved by our team, the refund process will be initiated.",

  bullets: [
    "Refunds are initiated only after your cancellation request has been reviewed and approved by the P&D Luxury Jewellery team.",

    "Approved refunds will be credited to the original payment method used while placing the order within 5–7 working days.",

    "The actual time taken for the refund to reflect in your account may vary depending on your bank, card issuer, or payment provider.",

    "If a cancellation request is declined, no refund will be processed, and your order will continue as scheduled.",

    "For any refund-related queries, you may contact our customer support team with your order details."
  ]

 
},
  {
  id: "shipping-policy",
  title: "Shipping Policy",
  icon: Truck,
  updated: "July 04, 2026",
  intro:
    "At P&D Luxury Jewellery, we strive to deliver every order safely and on time. All shipments are carefully packed, securely handled, and can be tracked throughout the delivery process.",

  bullets: [
    "Orders are typically processed and shipped within 7–20 business days. Processing times may vary depending on product availability and order requirements.",

    "Personalized, custom-made, or made-to-order jewellery may require additional processing time before shipment.",

    "If your order contains both personalized/custom jewellery and ready-to-ship items, we may ship them separately so available products reach you sooner.",

    "We offer free standard shipping on eligible domestic orders. Additional shipping charges may apply for international deliveries, expedited shipping, or special delivery requests.",

    "Once your order has been dispatched, a confirmation email containing your shipment tracking details and an attached e-invoice (PDF) will be sent, allowing you to track your order in real time.",

    "Every shipment is securely packaged to help ensure your jewellery arrives safely and in excellent condition."
  ]
},
  {
  id: "terms-and-conditions",
  title: "Terms & Conditions",
  icon: FileText,
  updated: "July 04, 2026",
  intro:
    "By accessing or using the P&D Luxury Jewellery website, you agree to comply with these Terms & Conditions. These terms govern your use of our website, products, and services.",

  bullets: [
    "You must be at least 18 years of age or the legal age of majority in your jurisdiction to use our website and place orders.",

    "Product images are for illustrative purposes only. Due to the nature of precious metals, gemstones, screen settings, and handcrafted manufacturing, slight variations in color, weight, dimensions, or finish may occur.",

    "Product prices, availability, offers, and specifications may change without prior notice. We reserve the right to correct pricing errors, update information, limit quantities, or discontinue products at any time.",

    "Customers are responsible for providing accurate billing, shipping, and contact information. We reserve the right to refuse, cancel, or modify orders suspected of fraud, unauthorized activity, or policy violations.",

    "All content on this website, including images, designs, logos, text, and graphics, is the intellectual property of P&D Luxury Jewellery and may not be copied, reproduced, or distributed without prior written permission.",

    "By using our website, you agree not to engage in unlawful activities, transmit malicious software, interfere with website functionality, or misuse our services in any manner.",

    "Your use of our website is also subject to our Privacy Policy, Shipping Policy, Refund Policy, and other applicable policies published on this website."
  ]
},

  {
  id: "cancellation-policy",
  title: "Cancellation Policy",
  icon: XCircle,
  updated: "July 04, 2026",
  intro:
    "If you wish to cancel an order, you can submit a cancellation request through your account. All cancellation requests are subject to review and approval by P&D Luxury Jewellery.",

  bullets: [
    "To request a cancellation, navigate to your order history, select the order, provide a cancellation reason, and submit your request.",

    "Submitting a cancellation request does not guarantee cancellation. Every request is reviewed by our team before a final decision is made.",

    "If your cancellation request is approved, you will be notified, and any applicable refund will be processed according to our Refund Policy.",

    "If your cancellation request is declined, the order will continue to be processed or delivered as scheduled.",

    "Orders that have already been shipped, delivered, or entered an irreversible production stage may not be eligible for cancellation."
  ]
},
  
 {
  id: "payment-policy",
  title: "Payment Policy",
  icon: CreditCard,
  updated: "July 04, 2026",
  intro:
    "P&D Luxury Jewellery provides secure and reliable payment options for both domestic and international customers through trusted payment partners.",

  bullets: [
    "Customers within India can complete their purchases securely using Razorpay, which supports UPI, Credit Cards, Debit Cards, Net Banking, and other supported payment methods.",

    "International customers can make payments securely using PayPal, allowing transactions through supported cards and PayPal accounts.",

    "All online payments are processed through encrypted and secure payment gateways. P&D Luxury Jewellery does not store your complete card details, CVV, or banking credentials.",

    "Orders will be confirmed only after successful payment authorization. If a payment fails or is declined, the order will not be processed until payment is successfully completed.",

    "In the event of payment failures or duplicate transactions, any eligible refunds will be processed according to our Refund Policy and the policies of the respective payment provider."
  ]
},
  
];

const readingTime = (policy) => {
  const words = (policy.intro + " " + policy.bullets.join(" ") + " " ).split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

/* ================================================================== */
/* THEME TOKENS (light / dark passed explicitly — no tailwind dark:)  */
/* ================================================================== */

const theme = (isDark) => ({
  pageBg: isDark ? "bg-[#161514]" : "bg-[#FAF9F6]",
  text: isDark ? "text-stone-200" : "text-slate-700",
  heading: isDark ? "text-stone-50" : "text-slate-900",
  cardBg: isDark ? "bg-[#1F1D1B]/80" : "bg-white/70",
  cardBorder: isDark ? "border-white/10" : "border-slate-200/70",
  sidebarBg: isDark ? "bg-[#1F1D1B]/70" : "bg-white/60",
  muted: isDark ? "text-stone-400" : "text-slate-500",
});

/* ================================================================== */
/* SIGNATURE MOTIF — faceted gem divider (drawn once per mount)       */
/* ================================================================== */

const GemDivider = ({ isDark }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { delay: i * 0.12, duration: 0.7, ease: "easeInOut" }, opacity: { delay: i * 0.12, duration: 0.2 } },
    }),
  };
  return (
    <div className="flex items-center gap-3 my-5">
      <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
      <motion.svg
        viewBox="0 0 40 36" className="w-6 h-5 shrink-0"
        initial="hidden" whileInView="show" viewport={{ once: true }}
      >
        <motion.path d="M6 13 L20 3 L34 13 L20 33 Z" fill="none" stroke="#D4AF37" strokeWidth="1.4" variants={draw} custom={0} />
        <motion.path d="M6 13 L34 13" stroke="#D4AF37" strokeWidth="1" opacity="0.6" variants={draw} custom={1} />
        <motion.path d="M14 13 L20 33" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" variants={draw} custom={2} />
        <motion.path d="M26 13 L20 33" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" variants={draw} custom={2} />
      </motion.svg>
      <div className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
    </div>
  );
};

/* ================================================================== */
/* SCROLL PROGRESS BAR                                                 */
/* ================================================================== */

const ScrollProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? (scrolled / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[60] bg-transparent">
      <motion.div
        className="h-full bg-gradient-to-r from-[#D4AF37] via-[#e8cf7a] to-[#2E8B57]"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

/* ================================================================== */
/* FLOATING BACKGROUND SHAPES (hero)                                  */
/* ================================================================== */

const FloatingShapes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[
      { size: 180, left: "8%", top: "15%", color: "#D4AF37", dur: 9 },
      { size: 120, left: "82%", top: "10%", color: "#2E8B57", dur: 11 },
      { size: 90, left: "70%", top: "65%", color: "#D4AF37", dur: 8 },
      { size: 140, left: "15%", top: "68%", color: "#2E8B57", dur: 10 },
    ].map((s, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full blur-3xl"
        style={{ width: s.size, height: s.size, left: s.left, top: s.top, backgroundColor: s.color, opacity: 0.12 }}
        animate={{ y: [0, -22, 0], x: [0, 12, 0] }}
        transition={{ duration: s.dur, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ================================================================== */
/* HERO SECTION                                                        */
/* ================================================================== */

const HeroSection = ({ isDark }) => (
  <section className={`relative overflow-hidden ${isDark ? "bg-[#1B1A18]" : "bg-gradient-to-b from-[#FFFDF8] to-[#FAF9F6]"} pt-28 pb-20 px-4`}>
    <FloatingShapes />
    <div className="relative z-10 max-w-3xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-[0.2em] font-semibold mb-6"
        style={{ backgroundColor: "rgba(212,175,55,0.12)", color: "#B8912E" }}
      >
        <Shield className="w-3.5 h-3.5" /> Trust & Transparency
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className={`font-serif text-5xl sm:text-6xl md:text-7xl font-light tracking-tight mb-5 ${isDark ? "text-stone-50" : "text-slate-900"}`}
      >
        Policies
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className={`text-base sm:text-lg font-light leading-relaxed ${isDark ? "text-stone-400" : "text-slate-500"}`}
      >
        Everything you need to know before shopping with us.
      </motion.p>
    </div>
  </section>
);

/* ================================================================== */
/* BREADCRUMB                                                          */
/* ================================================================== */

const Breadcrumb = ({ isDark, activeTitle }) => (
  <div className={`flex items-center gap-2 text-xs mb-6 ${isDark ? "text-stone-500" : "text-slate-400"}`}>
    <Home className="w-3.5 h-3.5" />
    <span>Home</span>
    <span>/</span>
    <span className={isDark ? "text-stone-300" : "text-slate-600"}>Policies</span>
    {activeTitle && (
      <>
        <span>/</span>
        <span style={{ color: "#B8912E" }} className="font-medium">{activeTitle}</span>
      </>
    )}
  </div>
);

/* ================================================================== */
/* TOOLBAR — search, expand/collapse, print, dark mode                */
/* ================================================================== */

const Toolbar = ({ isDark, setIsDark, search, setSearch, allExpanded, onToggleExpandAll }) => {
  const t = theme(isDark);
  return (
    <div className={`flex flex-wrap items-center gap-3 mb-8 p-3 rounded-2xl border ${t.cardBorder} ${t.sidebarBg} backdrop-blur-md`}>
      <div className={`flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-xl border ${isDark ? "border-white/10 bg-black/20" : "border-slate-200 bg-white"}`}>
        <Search className={`w-4 h-4 ${t.muted}`} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policies..."
          className={`w-full bg-transparent outline-none text-sm ${t.text} placeholder:${t.muted}`}
        />
        {search && (
          <button onClick={() => setSearch("")} aria-label="Clear search" className={t.muted}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      

      <button
        onClick={() => window.print()}
        aria-label="Print page"
        className={`p-2.5 rounded-xl border transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-stone-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
      >
        <Printer className="w-4 h-4" />
      </button>

      <button
        onClick={() => setIsDark((d) => !d)}
        aria-label="Toggle dark mode"
        className={`p-2.5 rounded-xl border transition-colors ${isDark ? "border-white/10 hover:bg-white/5 text-[#D4AF37]" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
      >
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
};

/* ================================================================== */
/* SIDEBAR (desktop) + MOBILE NAV                                      */
/* ================================================================== */

const NAV_HEIGHT_OFFSET = 96;

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT_OFFSET;
  window.scrollTo({ top, behavior: "smooth" });
  window.history.replaceState(null, "", `#${id}`);
};

const PolicySidebar = ({ isDark, activeId, visibleIds }) => {
  const t = theme(isDark);
  return (
    <nav
      aria-label="Policy navigation"
      className={`hidden lg:block sticky top-24 self-start w-64 shrink-0 rounded-2xl border ${t.cardBorder} ${t.sidebarBg} backdrop-blur-md p-3`}
    >
      <p className={`px-3 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold ${t.muted}`}>On this page</p>
      <ul className="space-y-1 relative">
        {policies.map((p) => {
          const isActive = activeId === p.id;
          const isVisible = visibleIds.has(p.id);
          return (
            <li key={p.id} className="relative">
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ backgroundColor: "rgba(212,175,55,0.12)" }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <button
                onClick={() => scrollToSection(p.id)}
                disabled={!isVisible}
                className={`relative z-10 group w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                  isVisible ? "" : "opacity-30 cursor-not-allowed"
                } ${isActive ? "font-semibold" : "font-normal"}`}
                style={{ color: isActive ? "#B8912E" : isDark ? "#d6d3d1" : "#475569" }}
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 transition-transform ${isActive ? "scale-100" : "scale-0"}`} style={{ backgroundColor: "#D4AF37" }} />
                <span className="relative">
                  {p.title}
                  <span
                    className="absolute -bottom-1 left-0 h-px bg-current w-0 group-hover:w-full transition-all duration-300"
                    style={{ opacity: isActive ? 0 : 0.5 }}
                  />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

const MobileNav = ({ isDark, activeId, visibleIds }) => {
  const [open, setOpen] = useState(false);
  const t = theme(isDark);
  return (
    <div className="lg:hidden sticky top-0 z-40 -mx-4 px-4 py-2 backdrop-blur-md" style={{ backgroundColor: isDark ? "rgba(22,21,20,0.85)" : "rgba(250,249,246,0.85)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${t.cardBorder} ${t.sidebarBg}`}
      >
        <span className={`text-sm font-medium ${t.text}`}>
          {policies.find((p) => p.id === activeId)?.title || "Browse policies"}
        </span>
        {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`mt-2 rounded-xl border ${t.cardBorder} ${t.sidebarBg} p-2 grid grid-cols-2 gap-1.5`}>
              {policies.map((p) => {
                const isVisible = visibleIds.has(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={!isVisible}
                    onClick={() => { scrollToSection(p.id); setOpen(false); }}
                    className={`text-left text-xs px-3 py-2 rounded-lg transition-colors ${isVisible ? "" : "opacity-30"}`}
                    style={{
                      backgroundColor: activeId === p.id ? "rgba(212,175,55,0.12)" : "transparent",
                      color: activeId === p.id ? "#B8912E" : isDark ? "#d6d3d1" : "#475569",
                    }}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ================================================================== */
/* POLICY BADGE                                                        */
/* ================================================================== */

const PolicyBadge = ({ isDark, children, tone = "gold" }) => {
  const styles =
    tone === "gold"
      ? { backgroundColor: "rgba(212,175,55,0.14)", color: "#B8912E" }
      : { backgroundColor: "rgba(46,139,87,0.14)", color: "#2E8B57" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full" style={styles}>
      {children}
    </span>
  );
};

/* ================================================================== */
/* NOTE / INFO BOX                                                     */
/* ================================================================== */

const NoteBox = ({ isDark, tone, text }) => {
  const isWarning = tone === "warning";
  const Icon = isWarning ? AlertTriangle : Info;
  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 mt-5 border"
      style={{
        backgroundColor: isWarning ? "rgba(217,119,6,0.08)" : "rgba(46,139,87,0.08)",
        borderColor: isWarning ? "rgba(217,119,6,0.25)" : "rgba(46,139,87,0.25)",
      }}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: isWarning ? "#B45309" : "#2E8B57" }} />
      <p className={`text-sm leading-relaxed ${isDark ? "text-stone-300" : "text-slate-600"}`}>{text}</p>
    </div>
  );
};

/* ================================================================== */
/* POLICY ACCORDION — extra fine-print, controlled by parent state    */
/* ================================================================== */

const PolicyAccordion = ({ isDark, isOpen, onToggle, title, children }) => (
  <div className={`mt-5 rounded-xl border overflow-hidden ${isDark ? "border-white/10" : "border-slate-200"}`}>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors ${isDark ? "text-stone-200 hover:bg-white/5" : "text-slate-700 hover:bg-slate-50"}`}
    >
      {title}
      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
        <ChevronDown className="w-4 h-4" />
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className={`px-4 pb-4 text-sm leading-relaxed ${isDark ? "text-stone-400" : "text-slate-500"}`}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ================================================================== */
/* POLICY CARD / SECTION                                               */
/* ================================================================== */

const PolicyCard = ({ policy, index, isDark, isOpen, onToggleAccordion, registerRef }) => {
  const t = theme(isDark);
  const Icon = policy.icon;
  const fromLeft = index % 2 === 0;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#${policy.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${policy.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: policy.title, url });
      } catch {
        /* user cancelled — no-op */
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.section
      id={policy.id}
      ref={registerRef}
      initial={{ opacity: 0, x: fromLeft ? -40 : 40, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={`scroll-mt-24 rounded-3xl border ${t.cardBorder} ${t.cardBg} backdrop-blur-md p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_15px_45px_rgba(212,175,55,0.08)]`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.08 }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "rgba(212,175,55,0.12)" }}
          >
            <Icon className="w-5 h-5" style={{ color: "#B8912E" }} />
          </motion.div>
          <div>
            <h2 className={`font-serif text-2xl sm:text-3xl font-medium ${t.heading}`}>{policy.title}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PolicyBadge isDark={isDark}>Updated {policy.updated}</PolicyBadge>
              <PolicyBadge isDark={isDark} tone="emerald">
                <Clock className="w-3 h-3" /> {readingTime(policy)} min read
              </PolicyBadge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyLink}
            aria-label="Copy link to section"
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-stone-400" : "hover:bg-slate-100 text-slate-400"}`}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Link2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleShare}
            aria-label="Share this policy"
            className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-white/5 text-stone-400" : "hover:bg-slate-100 text-slate-400"}`}
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <GemDivider isDark={isDark} />

      <p className={`text-sm sm:text-base leading-relaxed ${t.text}`}>{policy.intro}</p>

      <ul className="mt-4 space-y-2.5">
        {policy.bullets.map((b, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm sm:text-[15px] leading-relaxed ${t.text}`}>
            <span className="mt-2 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: "#2E8B57" }} />
            {b}
          </li>
        ))}
      </ul>

     

      
    </motion.section>
  );
};

/* ================================================================== */
/* BACK TO TOP                                                         */
/* ================================================================== */

const BackToTopButton = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: "#1F1D1B" }}
        >
          <ArrowUp className="w-4 h-4 text-[#D4AF37]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

/* ================================================================== */
/* MAIN PAGE                                                           */
/* ================================================================== */

export default function PoliciesPage() {
  const [isDark, setIsDark] = useState(false);
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState(policies[0].id);
  const [openAccordions, setOpenAccordions] = useState(new Set());
  const sectionRefs = useRef({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return policies;
    return policies.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.intro.toLowerCase().includes(q) ||
        p.bullets.some((b) => b.toLowerCase().includes(q))
    );
  }, [search]);

  const visibleIds = useMemo(() => new Set(filtered.map((p) => p.id)), [filtered]);
  const allExpanded = openAccordions.size === policies.length;

  const toggleAccordion = useCallback((id) => {
    setOpenAccordions((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleExpandAll = () => {
    setOpenAccordions(allExpanded ? new Set() : new Set(policies.map((p) => p.id)));
  };

  // Scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Hash routing on load
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      requestAnimationFrame(() => scrollToSection(id));
    }
  }, []);

  const t = theme(isDark);
  const activeTitle = policies.find((p) => p.id === activeId)?.title;

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.pageBg} ${t.text}`}>
      <ScrollProgress />
      <HeroSection isDark={isDark} />

      <div className="max-w-6xl mx-auto px-4 pb-24 -mt-8 relative z-10">
        <MobileNav isDark={isDark} activeId={activeId} visibleIds={visibleIds} />

        <div className="mt-6">
          <Breadcrumb isDark={isDark} activeTitle={activeTitle} />
        </div>

        <Toolbar
          isDark={isDark}
          setIsDark={setIsDark}
          search={search}
          setSearch={setSearch}
          allExpanded={allExpanded}
          onToggleExpandAll={toggleExpandAll}
        />

        <div className="flex gap-8">
          <PolicySidebar isDark={isDark} activeId={activeId} visibleIds={visibleIds} />

          <main className="flex-1 space-y-8 min-w-0">
            {filtered.length === 0 ? (
              <div className={`text-center py-20 rounded-3xl border ${t.cardBorder} ${t.cardBg}`}>
                <p className={`text-lg font-serif ${t.heading}`}>No policies match "{search}"</p>
                <p className={`text-sm mt-2 ${t.muted}`}>Try a different keyword, like "returns" or "shipping."</p>
              </div>
            ) : (
              filtered.map((policy, index) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  index={index}
                  isDark={isDark}
                  isOpen={openAccordions.has(policy.id)}
                  onToggleAccordion={() => toggleAccordion(policy.id)}
                  registerRef={(el) => (sectionRefs.current[policy.id] = el)}
                />
              ))
            )}
          </main>
        </div>
      </div>

      <BackToTopButton />
    </div>
  );
}