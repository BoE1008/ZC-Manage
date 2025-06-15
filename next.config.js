/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: "dist",
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["ahooks"],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: "http://localhost:3000/api/:path*",
        },
        {
          source: "/:path*",
          destination: `http://123.60.88.8/:path*`,
          // destination: 'http://192.168.0.103:8080/:path*',
        },
      ],
    };
  },
};

module.exports = nextConfig;
