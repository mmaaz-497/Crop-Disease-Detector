/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // GSAP conflicts with React 18 Strict Mode's double-mount cycle
  // maxDuration is set per-route in app/api/analyze/route.ts, not here
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.openai.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
