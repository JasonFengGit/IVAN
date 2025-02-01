const path = require('path')

/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
      };
    }
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [
        {
          loader: '@svgr/webpack',
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: 'prefixIds',
                  active: false,
                },
              ],
            },
          },
        },
        { loader: 'url-loader' },
      ],
    })
    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: ['next/babel'],
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]]
          }
        }
      ]
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/hooks': path.resolve(__dirname, './components/navi/hooks'),
      '@/store': path.resolve(__dirname, './components/navi/store'),
      '@/contexts': path.resolve(__dirname, './components/navi/contexts'),
      '@/utils': path.resolve(__dirname, './components/navi/utils'),
      '@/config': path.resolve(__dirname, './components/navi/config'),
      '@/sui': path.resolve(__dirname, './components/navi/sui')
    }
    return config
  },
  experimental: {
    legacyDecorators: true // Enable legacy decorators
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
}