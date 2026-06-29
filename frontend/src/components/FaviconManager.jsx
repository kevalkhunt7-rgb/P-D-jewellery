import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '../context/SettingsContext';
import staticLogo from "../assets/logo.png"; // Fallback asset if needed

export function FaviconManager() {
  const { settings } = useSettings();

  // 1. Fallback resolutions if backend values are completely empty
  const faviconUrl = settings?.general?.favicon?.url || staticLogo;
  const pageTitle = settings?.seo?.metaTitle || settings?.general?.storeName || "P&D Luxury Jewellery";
  const pageDescription = settings?.seo?.metaDescription || "Crafting timeless elegance through exquisite jewellery.";
  const ogImageUrl = settings?.seo?.ogImage?.url || "";

  return (
    <Helmet>
      {/* Dynamic Favicon */}
      <link id="dynamic-favicon" rel="icon" type="image/png" href={faviconUrl} />

      {/* Dynamic Document Titles */}
      <title>{pageTitle}</title>

      {/* Dynamic Meta SEO and Social Graphs */}
      <meta name="description" content={pageDescription} />
      {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
    </Helmet>
  );
}