/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required so pdfkit (Node.js built-ins like 'fs', 'stream', etc.)
  // work correctly in API routes
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
