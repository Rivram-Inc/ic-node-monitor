/** @type {import('next').NextConfig} */
const nextConfig = {
  // env
  env: {
    API_URL: process.env.API_URL,
    API_TOKEN: process.env.API_TOKEN,
  },
};

export default nextConfig;
