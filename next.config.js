/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: [
      '*',  // ← Replace with YOUR IP
      'localhost',
      '127.0.0.1',
    ],
  },
}

module.exports = nextConfig