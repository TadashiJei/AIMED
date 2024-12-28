/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'ui-avatars.com',
      'www.gravatar.com',
      'gravatar.com'
    ],
  },
};

module.exports = nextConfig;
