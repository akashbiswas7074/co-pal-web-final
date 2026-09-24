/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  devIndicators: false,
  compress: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  // Turbopack configuration (Next.js 16+ uses Turbopack by default)
  turbopack: {},
  webpack: (config, { isServer }) => {
    // Exclude Node.js built-in modules from client-side bundle
    if (!isServer) {
      // Replace direct node dependencies with emptys/stubs for browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: path.resolve(__dirname, './lib/utils/fs-mock.js'),
        path: path.resolve(__dirname, './lib/utils/path-mock.js'),
        os: path.resolve(__dirname, './lib/utils/os-mock.js'),
        "timers/promises": false,
        tls: false,
        "child_process": false,
        net: false,
        dns: false,
        http2: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
        assert: false,
        stream: false,
        crypto: false,
        buffer: false,
      };
      
      // Add polyfill for Buffer and process
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      );
      
      // Use webpack ignores to handle MongoDB client-side encryption
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /mongodb\/lib\/client-side-encryption/,
          path.resolve(__dirname, './lib/utils/mongo-empty-module.js')
        )
      );
    }

    // Better handling for node-gyp-build
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      'node-gyp-build': path.resolve(__dirname, './lib/utils/node-gyp-build-stub.js'),
    };
    
    return config;
  },
  transpilePackages: ['mongodb'],
  async redirects() {
    return [
      { source: '/privacy', destination: '/return-policy', permanent: false },
      { source: '/privacy-policy', destination: '/return-policy', permanent: false },
      { source: '/terms', destination: '/return-policy', permanent: false },
      { source: '/terms-and-conditions', destination: '/return-policy', permanent: false },
      { source: '/cookie-policy', destination: '/return-policy', permanent: false },
      { source: '/returns-and-cancellations', destination: '/return-policy', permanent: false },
      { source: '/shipping', destination: '/track-order', permanent: false },
      { source: '/shipping-and-delivery', destination: '/track-order', permanent: false },
      { source: '/faqs', destination: '/faq', permanent: false },
      { source: '/shop/new-arrivals', destination: '/shop', permanent: false },
      { source: '/about', destination: '/contact', permanent: false },
    ];
  },
};

module.exports = nextConfig;