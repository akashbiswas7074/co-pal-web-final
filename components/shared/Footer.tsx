'use client';

import { lazy, Suspense } from "react";
import { Facebook, Instagram, Youtube, AtSign, Twitter, Linkedin } from "lucide-react";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWebsiteLogo } from "@/hooks/use-website-logo";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useWebsiteFooter } from "@/hooks/use-website-footer";
import { useFooterSettings } from "@/hooks/use-footer-settings";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Loading skeleton for the main footer content
const FooterContentSkeleton = () => (
  <div className="footer-wrapper animate-pulse">
    {/* Subscribe banner skeleton */}
    <div className="subscribe-banner" style={{ background: '#2563eb', padding: '32px 24px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="h-4 w-40 bg-blue-300 rounded mb-2"></div>
          <div className="h-8 w-64 bg-blue-300 rounded mb-2"></div>
          <div className="h-4 w-80 bg-blue-300 rounded"></div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 h-12 bg-blue-300 rounded-full"></div>
          <div className="w-32 h-12 bg-blue-200 rounded-full"></div>
        </div>
      </div>
    </div>
    {/* Main footer skeleton */}
    <div style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)', padding: '48px 24px' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="space-y-4">
          <div className="h-8 w-40 bg-gray-600 rounded mb-4"></div>
          <div className="h-6 w-32 bg-gray-600 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-600 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
          </div>
          <div className="h-4 w-48 bg-gray-600 rounded"></div>
          <div className="h-4 w-36 bg-gray-600 rounded"></div>
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-24 bg-gray-600 rounded"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 w-20 bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        ))}
        <div className="space-y-4">
          <div className="h-6 w-24 bg-gray-600 rounded"></div>
          <div className="h-4 w-full bg-gray-600 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Loading skeleton for logo section
const LogoSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 w-40 bg-gray-600 rounded mb-4"></div>
    <div className="h-6 w-32 bg-gray-600 rounded"></div>
    <div className="space-y-2">
      <div className="h-4 w-full bg-gray-600 rounded"></div>
      <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
    </div>
    <div className="h-4 w-48 bg-gray-600 rounded"></div>
    <div className="h-4 w-36 bg-gray-600 rounded"></div>
    <div className="flex space-x-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-5 w-5 bg-gray-600 rounded"></div>
      ))}
    </div>
  </div>
);

// Loading skeleton for link sections
const LinksSkeleton = ({ title, count = 5 }: { title: string; count?: number }) => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 w-24 bg-gray-600 rounded"></div>
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-4 w-20 bg-gray-600 rounded"></div>
      ))}
    </div>
  </div>
);

// Subscribe Banner at top of footer
const SubscribeBanner = () => {
  return (
    <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="w-full md:w-auto md:flex-1">
          <p className="text-blue-200 text-xs sm:text-sm font-medium tracking-wider uppercase mb-1.5">
            Newsletter Signup
          </p>
          <h2 className="text-white text-2xl sm:text-3xl font-bold mb-1.5 sm:mb-2 leading-tight">
            Subscribe & Save
          </h2>
          <p className="text-blue-100 text-sm max-w-md">
            Be first to experience new creations, special offers, and limited releases.
          </p>
        </div>
        <div className="flex w-full md:w-auto md:flex-1 max-w-md">
          <input
            type="email"
            placeholder="Enter Your Email Address"
            className="flex-1 w-full min-w-0 px-4 py-3 sm:px-5 sm:py-3.5 rounded-l-full border-none outline-none text-sm text-slate-800 bg-white/95"
          />
          <button
            className="px-5 py-3 sm:px-7 sm:py-3.5 rounded-r-full border-2 border-l-0 border-white/50 bg-transparent text-white font-bold text-sm tracking-widest whitespace-nowrap transition-colors hover:bg-white/15 focus:outline-none flex-shrink-0"
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for newsletter subscription (kept for inside-footer fallback)
const NewsletterSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-6 w-24 bg-gray-600 rounded"></div>
    <div className="space-y-2">
      <div className="h-4 w-full bg-gray-600 rounded"></div>
      <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
    </div>
    <div className="flex">
      <div className="flex-1 h-10 bg-gray-600 rounded-l"></div>
      <div className="w-16 h-10 bg-gray-600 rounded-r"></div>
    </div>
    <div className="h-4 w-32 bg-gray-600 rounded"></div>
  </div>
);

// Social media links component
const SocialMediaLinks = ({ socialLinks }: { socialLinks: any }) => (
  <div className="flex space-x-4">
    {socialLinks.facebook && (
      <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
        <Facebook size={20} />
      </a>
    )}
    {socialLinks.instagram && (
      <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
        <Instagram size={20} />
      </a>
    )}
    {socialLinks.youtube && (
      <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
        <Youtube size={20} />
      </a>
    )}
    {socialLinks.twitter && (
      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
        <Twitter size={20} />
      </a>
    )}
    {socialLinks.linkedin && (
      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#9ca3af', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#9ca3af')}>
        <Linkedin size={20} />
      </a>
    )}
  </div>
);

const SocialMediaSkeleton = () => (
  <div className="flex space-x-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-5 w-5 bg-gray-600 rounded"></div>
    ))}
  </div>
);

// Company info section
const CompanyInfoSection = () => {
  const { logo, isLoading: logoLoading } = useWebsiteLogo();
  const siteConfig = useSiteConfig();
  const { footer, isLoading: footerLoading } = useWebsiteFooter();
  const { settings } = useFooterSettings();

  if (logoLoading || footerLoading) {
    return <LogoSkeleton />;
  }

  const logoUrl = logo?.logoUrl || siteConfig.logo.imagePath;
  const altText = logo?.altText || siteConfig.name;
  const logoText = logo?.name || siteConfig.logo.text;
  const showLogoImage = logo?.logoUrl || siteConfig.logo.useImage;
  const footerName = footer?.name || "Main Footer";
  const contactEmail = footer?.contactInfo?.email || siteConfig.contact.email;
  const contactPhone = footer?.contactInfo?.phone || siteConfig.contact.phone;
  const contactAddress = footer?.contactInfo?.address || siteConfig.contact.address;
  const socialLinks = footer?.socialMedia || siteConfig.social || {};

  return (
    <div className="space-y-4">
      {showLogoImage ? (
        <div className="relative h-16 w-full max-w-[240px] mb-4">
          <Image
            src={logoUrl}
            alt={altText}
            fill
            className="object-contain object-left lazy-image"
            loading="lazy"
          />
        </div>
      ) : (
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: settings.textColor }}>{logoText}</h2>
      )}
      {footer?.showFooterName !== false && (
        <h3 style={{ fontSize: '16px', fontWeight: 500, color: settings.textColor, opacity: 0.9 }}>{footerName}</h3>
      )}
      <p style={{ fontSize: '13px', color: settings.textColor, opacity: 0.8, lineHeight: 1.6 }}>{contactAddress}</p>
      <p style={{ fontSize: '13px', color: settings.textColor, opacity: 0.8 }}>{contactEmail}</p>
      <p style={{ fontSize: '13px', color: settings.textColor, opacity: 0.8 }}>{contactPhone}</p>

      <Suspense fallback={<SocialMediaSkeleton />}>
        <SocialMediaLinks socialLinks={socialLinks} />
      </Suspense>
    </div>
  );
};

// Footer links section
const FooterLinksSection = ({ type, title }: { type: 'company' | 'shop' | 'help' | 'policy'; title: string }) => {
  const { footer, isLoading } = useWebsiteFooter();
  const { settings } = useFooterSettings();

  if (isLoading) {
    return <LinksSkeleton title={title} />;
  }

  let links: Array<{ title: string; url: string }>;
  switch (type) {
    case 'company':
      links = footer?.companyLinks || [
        { title: "About Us", url: "/about" },
        { title: "Careers", url: "#" },
        { title: "Affiliates", url: "#" },
        { title: "Blog", url: "#" },
        { title: "Contact Us", url: "/contact" }
      ];
      break;
    case 'shop':
      links = footer?.shopLinks || [
        { title: "New Arrivals", url: "#new-arrivals" },
        { title: "Accessories", url: "/shop?category=accessories" },
        { title: "Men", url: "/shop?category=men" },
        { title: "Women", url: "/shop?category=women" },
        { title: "All Products", url: "/shop" }
      ];
      break;
    case 'help':
      links = footer?.helpLinks || [
        { title: "Customer Service", url: "/contact" },
        { title: "My Account", url: "/profile" },
        { title: "Find a Store", url: "#" },
        { title: "Legal & Privacy", url: "#" },
        { title: "Gift Card", url: "#" }
      ];
      break;
    case 'policy':
      links = footer?.policyLinks || [
        { title: "Privacy Policy", url: "/privacy-policy" },
        { title: "Cookie Policy", url: "/cookie-policy" },
        { title: "Returns & Cancellations", url: "/returns-and-cancellations" },
        { title: "Shipping & Delivery", url: "/shipping-and-delivery" },
        { title: "Terms & Conditions", url: "/terms-and-conditions" }
      ];
      break;
    default:
      links = [];
  }

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: settings.textColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {links.map((link, index) => {
          const isHashLink = link.url?.startsWith('#') || !link.url;
          const linkStyle = { color: settings.textColor, opacity: 0.8, transition: 'opacity 0.2s', fontSize: '13px' };
          const hoverIn = (e: any) => e.currentTarget.style.opacity = '1';
          const hoverOut = (e: any) => e.currentTarget.style.opacity = '0.8';

          if (isHashLink) {
            return (
              <li key={index}>
                <a href={link.url || '#'} style={linkStyle}
                  onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  {link.title}
                </a>
              </li>
            );
          }

          return (
            <li key={index}>
              <Link href={link.url} style={linkStyle}
                onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                {link.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Footer bottom section
const FooterBottomSection = () => {
  const siteConfig = useSiteConfig();
  const { footer, isLoading } = useWebsiteFooter();
  const { settings } = useFooterSettings();

  if (isLoading) {
    return (
      <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' }}
        className="md:flex-row md:justify-between md:items-center animate-pulse">
        <div className="h-4 w-48 bg-gray-600 rounded"></div>
        <div className="flex space-x-4">
          <div className="h-4 w-16 bg-gray-600 rounded"></div>
          <div className="h-4 w-32 bg-gray-600 rounded"></div>
          <div className="h-4 w-16 bg-gray-600 rounded"></div>
          <div className="h-4 w-12 bg-gray-600 rounded"></div>
        </div>
      </div>
    );
  }

  const copyrightText = footer?.copyrightText || `© ${new Date().getFullYear()} ${siteConfig.name}`;

  return (
    <div style={{
      marginTop: '48px',
      paddingTop: '24px',
      borderTop: `1px solid ${settings.textColor}40`,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      fontSize: '13px',
      color: settings.textColor,
      opacity: 0.8
    }}
      className="md:flex-row md:justify-between md:items-center">
      <p>{copyrightText}</p>
    </div>
  );
};

export default function Footer() {
  const { isLoading: logoLoading } = useWebsiteLogo();
  const { isLoading: footerLoading } = useWebsiteFooter();
  const { settings, loading: settingsLoading } = useFooterSettings();
  const pathname = usePathname();

  if (logoLoading || footerLoading || settingsLoading) {
    return <FooterContentSkeleton />;
  }

  const getBackgroundStyle = () => {
    switch (settings.backgroundType) {
      case 'mesh':
        return `
          radial-gradient(ellipse at 0% 100%, rgba(120, 40, 200, 0.55) 0%, transparent 50%),
          radial-gradient(ellipse at 20% 60%, rgba(0, 180, 160, 0.35) 0%, transparent 45%),
          radial-gradient(ellipse at 100% 100%, rgba(80, 140, 60, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 50% 50%, rgba(30, 20, 60, 0.8) 0%, transparent 70%),
          ${settings.backgroundColorValue}
        `.replace(/\s+/g, ' ');
      case 'gradient':
        return settings.backgroundGradientValue;
      case 'blur':
        return `rgba(0, 0, 0, ${settings.blurOpacity / 100})`;
      case 'solid':
      default:
        return settings.backgroundColorValue;
    }
  };

  return (
    <div className="footer-wrapper">
      {/* Subscribe Banner — sits on top of the footer */}
      <SubscribeBanner />

      {/* Main Footer with custom styling */}
      <footer style={{
        background: getBackgroundStyle(),
        backdropFilter: settings.backgroundType === 'blur' ? 'blur(12px)' : 'none',
        color: settings.textColor,
        padding: '56px 24px 32px',
        transition: 'all 0.4s ease'
      }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <Suspense fallback={<LogoSkeleton />}>
            <CompanyInfoSection />
          </Suspense>

          <Suspense fallback={<LinksSkeleton title="COMPANY" />}>
            <FooterLinksSection type="company" title="COMPANY" />
          </Suspense>

          <Suspense fallback={<LinksSkeleton title="SHOP" />}>
            <FooterLinksSection type="shop" title="SHOP" />
          </Suspense>

          <Suspense fallback={<LinksSkeleton title="HELP" />}>
            <FooterLinksSection type="help" title="HELP" />
          </Suspense>

          <Suspense fallback={<LinksSkeleton title="POLICIES" />}>
            <FooterLinksSection type="policy" title="POLICIES" />
          </Suspense>

          {/* Secure Payments info (replaces old subscribe column) */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: settings.textColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              SECURE PAYMENTS
            </h3>
            <p style={{ fontSize: '13px', color: settings.textColor, opacity: 0.8, lineHeight: 1.6, marginBottom: '16px' }}>
              We support all major payment methods and ensure your transactions are safe and encrypted.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <FaCcVisa 
                size={38} 
                color={settings.textColor} 
                style={{ opacity: 0.8 }} 
                title="Visa" 
              />
              <FaCcMastercard 
                size={38} 
                color={settings.textColor} 
                style={{ opacity: 0.8 }} 
                title="Mastercard" 
              />
              <FaCcAmex 
                size={38} 
                color={settings.textColor} 
                style={{ opacity: 0.8 }} 
                title="American Express" 
              />
              <span 
                style={{
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  border: `1.5px solid ${settings.textColor}`,
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 900,
                  fontStyle: 'italic',
                  color: settings.textColor,
                  opacity: 0.8,
                  letterSpacing: '0.05em',
                  marginTop: '1px' // alignment tweak
                }}
                title="UPI"
              >
                UPI
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <Suspense fallback={
            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}
              className="flex flex-col md:flex-row justify-between items-center animate-pulse">
              <div className="h-4 w-48 bg-gray-600 rounded"></div>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                <div className="h-4 w-32 bg-gray-600 rounded"></div>
                <div className="h-4 w-16 bg-gray-600 rounded"></div>
                <div className="h-4 w-12 bg-gray-600 rounded"></div>
              </div>
            </div>
          }>
            <FooterBottomSection />
          </Suspense>
        </div>
      </footer>
    </div>
  );
}
