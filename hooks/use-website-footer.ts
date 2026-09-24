"use client";

import { useEffect, useState, useRef } from "react";
import { siteConfig } from "@/lib/site-config";

export interface WebsiteFooter {
  _id?: string;
  name?: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  companyLinks?: Array<{
    title: string;
    url: string;
  }>;
  shopLinks?: Array<{
    title: string;
    url: string;
  }>;
  helpLinks?: Array<{
    title: string;
    url: string;
  }>;
  policyLinks?: Array<{
    title: string;
    url: string;
  }>;
  copyrightText?: string;
  showFooterName?: boolean;
  isActive?: boolean;
}

interface UseWebsiteFooterResult {
  footer: WebsiteFooter;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Global in-memory cache to prevent redundant fetches across multiple footer subcomponents
let cachedFooterData: WebsiteFooter | null = null;
let activeFetchPromise: Promise<WebsiteFooter | null> | null = null;

export function useWebsiteFooter(): UseWebsiteFooterResult {
  const [footer, setFooter] = useState<WebsiteFooter>(() => cachedFooterData || {
    contactInfo: {
      email: siteConfig.contact.email,
      phone: siteConfig.contact.phone,
      address: siteConfig.contact.address,
    },
    socialMedia: {
      facebook: siteConfig.social?.facebook || "",
      twitter: siteConfig.social?.twitter || "",
      instagram: siteConfig.social?.instagram || "",
      youtube: siteConfig.social?.youtube || "",
      linkedin: "",
    },
    copyrightText: `© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.`,
  });
  const [isLoading, setIsLoading] = useState(!cachedFooterData);
  const [error, setError] = useState<string | null>(null);

  const fetchFooter = async () => {
    if (cachedFooterData) {
      setFooter(cachedFooterData);
      setIsLoading(false);
      return;
    }

    if (!activeFetchPromise) {
      activeFetchPromise = (async () => {
        try {
          const response = await fetch("/api/website/footer");
          if (!response.ok) return null;
          const data = await response.json();
          if (data.success && data.footer) {
            cachedFooterData = data.footer;
            return data.footer;
          }
        } catch (e) {
          console.error("Footer fetch error:", e);
        }
        return null;
      })();
    }

    try {
      const result = await activeFetchPromise;
      if (result) {
        setFooter(result);
      }
    } catch (err: any) {
      setError("Failed to load footer data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFooter();
  }, []);

  return { footer, isLoading, error, refetch: fetchFooter };
}