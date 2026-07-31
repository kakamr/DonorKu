import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    allowedDevOrigins: ["*.ngrok-free.app"],
  },
};

export default nextConfig;