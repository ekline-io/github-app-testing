/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['formidable'],
  },
  api: {
    bodyParser: false,
  },
};

export default nextConfig; 
