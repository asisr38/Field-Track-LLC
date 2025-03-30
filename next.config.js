/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ]
  },
  webpack: config => {
    config.externals.push({
      cobe: "cobe"
    });
    config.module.rules.push({
      test: /\.(geojson|json)$/,
      type: "json"
    });
    return config;
  },
  typescript: {
    // ⚠️ Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
