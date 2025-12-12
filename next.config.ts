import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  typescript: {
    ignoreBuildErrors: true, 
  },

  // 这里的 experimental.serverActions.allowedOrigins 不需要了
  // 因为 middleware 已经帮我们搞定了所有域名
};

export default nextConfig;