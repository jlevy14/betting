/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESPN images (team logos / headshots) are served from these hosts.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "a.espncdn.com" },
      { protocol: "https", hostname: "*.espncdn.com" },
    ],
  },
};

export default nextConfig;
