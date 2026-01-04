/** @type {import('next').NextConfig} */
const path = require('path');
const webpack = require('webpack');

const nextConfig = {
  images: {
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
};

module.exports = nextConfig;