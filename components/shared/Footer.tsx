'use client';

import { lazy, Suspense } from "react";
import { Facebook, Instagram, Youtube, AtSign, Twitter, Linkedin } from "lucide-react";
import { Input } from "@/components/ui/input";

const VisaIcon = ({ color }: { color?: string }) => (
  <svg width="38" height="26" viewBox="0 0 48 32" fill="none" className="opacity-80" style={{ color }}>
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19.5 21L21.5 11H24L22 21H19.5ZM16.2 11L14.1 18.2L13.8 16.8C13.4 15.4 12.1 13.9 10.7 13.2L13 21H15.6L19.4 11H16.2ZM30.7 14.5C30.7 13.1 28.8 13 27.2 13C25.2 13 24.1 13.5 24.1 13.5L24.5 15.3C24.5 15.3 25.5 14.9 26.9 14.9C27.9 14.9 28.4 15.4 28.4 16C28.4 16.5 28 16.9 27 17.4C25.5 18.1 24.4 18.9 24.4 20.3C24.4 22.2 26.2 23 28.1 23C29.7 23 30.7 22.5 30.7 22.5L30.3 20.6C30.3 20.6 29.3 21 28.1 21C27.3 21 26.7 20.6 26.7 20C26.7 19.3 27.4 18.9 28.3 18.4C29.8 17.6 30.7 16.5 30.7 14.5ZM35.8 21H38L36.2 11H34.3C33.7 11 33.2 11.4 33 11.9L29.7 21H32.2L32.7 19.5H35.4L35.8 21ZM33.3 17.8L34.5 14.2L35.1 17.8H33.3Z" fill="currentColor"/>
  </svg>
);

const MastercardIcon = ({ color }: { color?: string }) => (
  <svg width="38" height="26" viewBox="0 0 48 32" fill="none" className="opacity-80" style={{ color }}>
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="19" cy="16" r="7" fill="currentColor" fillOpacity="0.4" />
    <circle cx="29" cy="16" r="7" fill="currentColor" fillOpacity="0.3" />
    <path d="M24 10.8C25.6 12.1 26.6 13.9 26.6 16C26.6 18.1 25.6 19.9 24 21.2C22.4 19.9 21.4 18.1 21.4 16C21.4 13.9 22.4 12.1 24 10.8Z" fill="currentColor" fillOpacity="0.7" />
  </svg>
);

const AmexIcon = ({ color }: { color?: string }) => (
  <svg width="38" height="26" viewBox="0 0 48 32" fill="none" className="opacity-80" style={{ color }}>
    <rect width="48" height="32" rx="4" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="1.5" />
    <text x="24" y="19" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.5">AMEX</text>
  </svg>
);
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

// Social Ticker — scrolling marquee bar linking to Facebook / Instagram from footer DB
const SocialBanners = () => {
  const { footer, isLoading } = useWebsiteFooter();

  if (isLoading) return null;

  const facebookUrl = footer?.socialMedia?.facebook;
  const instagramUrl = footer?.socialMedia?.instagram;

  if (!facebookUrl && !instagramUrl) return null;

  // Build repeating items for the marquee
  const items: Array<{ type: 'facebook' | 'instagram'; url: string }> = [];
  if (facebookUrl) items.push({ type: 'facebook', url: facebookUrl });
  if (instagramUrl) items.push({ type: 'instagram', url: instagramUrl });
  // Duplicate enough times for seamless scroll
  const duplicated = [...items, ...items, ...items, ...items, ...items, ...items];

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: facebookUrl && instagramUrl
          ? 'linear-gradient(90deg, #1877F2 0%, #833AB4 40%, #E1306C 70%, #F77737 100%)'
          : facebookUrl
          ? 'linear-gradient(90deg, #1877F2 0%, #0d5fd8 100%)'
          : 'linear-gradient(90deg, #833AB4 0%, #E1306C 60%, #F77737 100%)',
        padding: '10px 0',
      }}
    >
      {/* Scrolling marquee */}
      <div
        className="flex gap-0 whitespace-nowrap"
        style={{
          display: 'flex',
          animation: 'social-ticker-scroll 30s linear infinite',
          width: 'max-content',
        }}
      >
        {duplicated.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8"
            style={{ textDecoration: 'none', flexShrink: 0 }}
          >
            {item.type === 'facebook' ? (
              <>
                {/* Facebook icon — clean white F on blue circle */}
                <span
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 32, height: 32, background: '#fff' }}
                >
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="#1877F2">
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.696 4.533-4.696 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                  </svg>
                </span>
                <span className="font-bold text-white text-sm tracking-wide">Follow on Facebook</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>•</span>
              </>
            ) : (
              <>
                {/* Instagram icon — clean camera outline on white circle */}
                <span
                  className="inline-flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 32, height: 32, background: '#fff' }}
                >
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="none">
                    <defs>
                      <linearGradient id="ig-grad-footer" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F77737"/>
                        <stop offset="40%" stopColor="#E1306C"/>
                        <stop offset="70%" stopColor="#C13584"/>
                        <stop offset="100%" stopColor="#833AB4"/>
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad-footer)" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="4" stroke="url(#ig-grad-footer)" strokeWidth="2" fill="none"/>
                    <circle cx="17.5" cy="6.5" r="1.2" fill="url(#ig-grad-footer)"/>
                  </svg>
                </span>
                <span className="font-bold text-white text-sm tracking-wide">Follow on Instagram</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>•</span>
              </>
            )}
          </a>
        ))}
      </div>

      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes social-ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
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
        { title: "Find a Store", url: "/nearby-shops" },
        { title: "Legal & Privacy", url: "#" },
        { title: "Gift Card", url: "#" }
      ];
      break;
    case 'policy':
      links = footer?.policyLinks || [
        { title: "Privacy Policy", url: "/return-policy" },
        { title: "Cookie Policy", url: "/return-policy" },
        { title: "Returns & Cancellations", url: "/return-policy" },
        { title: "Shipping & Delivery", url: "/track-order" },
        { title: "Terms & Conditions", url: "/return-policy" }
      ];
      break;
    default:
      links = [];
  }

  // Normalize URLs to prevent 404 RSC prefetch loops
  const normalizeUrl = (rawUrl: string) => {
    if (!rawUrl || rawUrl === '#' || rawUrl.startsWith('#')) return '#';
    if (rawUrl === '/returns-and-cancellations' || rawUrl === '/terms-and-conditions' || rawUrl === '/privacy-policy' || rawUrl === '/cookie-policy' || rawUrl === '/privacy' || rawUrl === '/terms') {
      return '/return-policy';
    }
    if (rawUrl === '/faqs') return '/faq';
    if (rawUrl === '/shipping' || rawUrl === '/shipping-and-delivery') return '/track-order';
    if (rawUrl === '/shop/new-arrivals') return '/shop';
    if (rawUrl === '/about') return '/contact';
    return rawUrl;
  };

  return (
    <div>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: settings.textColor, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {title}
      </h3>
      <ul className="space-y-2 text-sm">
        {links.map((link, index) => {
          const finalUrl = normalizeUrl(link.url);
          const isHashLink = finalUrl === '#' || finalUrl.startsWith('#');
          const linkStyle = { color: settings.textColor, opacity: 0.8, transition: 'opacity 0.2s', fontSize: '13px' };
          const hoverIn = (e: any) => e.currentTarget.style.opacity = '1';
          const hoverOut = (e: any) => e.currentTarget.style.opacity = '0.8';

          if (isHashLink) {
            return (
              <li key={index}>
                <a href={finalUrl} style={linkStyle}
                  onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                  {link.title}
                </a>
              </li>
            );
          }

          return (
            <li key={index}>
              <Link href={finalUrl} prefetch={false} style={linkStyle}
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
      {/* Social Banners — Facebook/Instagram, from footer backend */}
      <SocialBanners />

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
              <VisaIcon color={settings.textColor} />
              <MastercardIcon color={settings.textColor} />
              <AmexIcon color={settings.textColor} />
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
