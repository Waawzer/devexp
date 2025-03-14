/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactive la vérification ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'oaidalleapiprodscus.blob.core.windows.net',
      'res.cloudinary.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/private/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dpoi45ksk/**',
      },
    ],
  },
  experimental: {
    // This is the proper way to configure serverComponentsExternalPackages in Next.js 14
    serverComponentsExternalPackages: ['cloudinary'],
  },
}

module.exports = nextConfig 