import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  ...(isProd
    ? [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self' https://*.trycloudflare.com",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.trycloudflare.com https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.trycloudflare.com",
            "font-src 'self' https://fonts.gstatic.com data: https://*.trycloudflare.com",
            "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.googleusercontent.com https://*.firebasestorage.app https://*.trycloudflare.com",
            "connect-src 'self' ws: wss: https://*.trycloudflare.com wss://*.trycloudflare.com https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.cloudinary.com",
            "frame-src 'self' https://*.firebaseapp.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
          ].join('; '),
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
