import React from 'react';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import { FaFacebookSquare, FaInstagram, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import logo from "../assets/logo.png";
import { motion, AnimatePresence } from 'framer-motion';
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[#2C2C2C] to-[#1a1a1a] text-white pt-16 pb-8">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div>
            <motion.img
              src={logo}
              alt="P&D Luxury Jewellery"
              className="h-25 cursor-pointer mb-5 w-auto object-contain scale-[1] origin-center"
              whileHover={{ rotate: 360 }}
              transition={{
                duration: 0.8,
                ease: "easeInOut",
              }}
            />
            <p className="mb-6 opacity-80" style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>
              Crafting timeless elegance through exquisite imitation jewelry. Every piece tells a story of beauty, grace, and sophistication.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FaFacebookSquare, href: '#' },
                { icon: FaInstagram, href: '#' },
                { icon: FaXTwitter, href: '#' },
                { icon: FaYoutube, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="social-footer-link w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300"
                  style={{ borderRadius: '50%' }}
                >
                  <social.icon className="w-5 h-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Quick Links
            </h4>
            <ul className="space-y-3" style={{ paddingLeft: 0, listStyle: 'none' }}>
              {['About Us', 'Collections', 'New Arrivals', 'Bridal', 'Gift Guide', 'Size Guide'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="opacity-80 hover:opacity-100 hover:text-[#B76E79] transition-all duration-300 inline-flex items-center gap-2"
                    style={{ fontSize: '0.875rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-serif mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Customer Care
            </h4>
            <ul className="space-y-3" style={{ paddingLeft: 0, listStyle: 'none' }}>
              {['Contact Us', 'Shipping Info', 'Returns & Exchanges', 'FAQ', 'Care Instructions', 'Warranty'].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="opacity-80 hover:opacity-100 hover:text-[#B76E79] transition-all duration-300 inline-flex items-center gap-2"
                    style={{ fontSize: '0.875rem', textDecoration: 'none', color: 'inherit' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" style={{ width: '6px', height: '6px', borderRadius: '50%' }} />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-serif mb-6" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
              Get In Touch
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#B76E79] flex-shrink-0 mt-1" />
                <p className="opacity-80" style={{ fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                  123 Jewelry Lane, Fashion District
                  <br />
                  New York, NY 10001
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#B76E79] flex-shrink-0" />
                <a href="tel:+1234567890" className="opacity-80 hover:opacity-100 transition-opacity" style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none' }}>
                  +1 (234) 567-8900
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#B76E79] flex-shrink-0" />
                <a href="mailto:hello@lumiere.com" className="opacity-80 hover:opacity-100 transition-opacity" style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none' }}>
                  hello@lumiere.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p
              className="opacity-70 text-center md:text-left"
              style={{ fontSize: '0.875rem', margin: 0 }}
            >
              © {currentYear} LUMIÈRE. All rights reserved.
            </p>

            <div
              className="flex items-center gap-2"
              style={{ fontSize: '0.875rem' }}
            >
              <span className="opacity-70">Made with</span>
              <Heart className="w-4 h-4 text-[#B76E79] fill-[#B76E79]" />
              <span className="opacity-70">for jewelry lovers</span>
            </div>

            <div className="flex gap-6">
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none' }}>
                Privacy Policy
              </a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity" style={{ fontSize: '0.875rem', color: 'inherit', textDecoration: 'none' }}>
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="opacity-50 mb-4" style={{ fontSize: '0.75rem', letterSpacing: '0.05em', margin: '0 0 16px 0' }}>
            SECURE PAYMENT METHODS
          </p>
          <div className="flex justify-center items-center gap-4 flex-wrap opacity-60">
            {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY'].map((payment) => (
              <div
                key={payment}
                className="px-4 py-2 bg-white/10 rounded"
                style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', borderRadius: '4px' }}
              >
                {payment}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded High Performance CSS Transitions */}
      <style>{`
        .social-footer-link {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.3s ease !important;
        }
        .social-footer-link:hover {
          transform: scale(1.2) rotate(5deg);
          background: linear-gradient(135deg, #B76E79 0%, #D4AF37 100%) !important;
        }
        .social-footer-link:active {
          transform: scale(0.95);
        }
      `}</style>
    </footer>
  );
}