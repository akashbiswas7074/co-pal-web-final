export interface SiteConfig {
  name: string;
  description: string;
  logo: {
    useImage: boolean;
    imagePath: string;
    showText: boolean;
    text: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export const siteConfig: SiteConfig = {
  name: "PEEDS",
  description: "Professional Sports Shoes, Gears & Equipment",
  logo: {
    useImage: true,
    imagePath: "https://res.cloudinary.com/dlrlet9fg/image/upload/v1777825306/products/buxqiaoquzcokc8vmtf0.webp",
    showText: true,
    text: "PEEDS"
  },
  contact: {
    email: "support@peeds.in",
    phone: "+91 98765 43210",
    address: "Surat, Gujarat, India"
  },
  social: {
    facebook: "https://facebook.com/peeds",
    instagram: "https://instagram.com/peeds",
    twitter: "https://twitter.com/peeds"
  }
}