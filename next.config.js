/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['goobs-frontend', 'goobs-cache'],
}

export default nextConfig
