/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // If NEXT_PUBLIC_API_URL is missing, default to localhost for local testing
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        // Mask 1: Looks like a generic article link
        source: '/article/:id',
        destination: `${apiUrl}/t/:id`, 
      },
      {
        // Mask 2: Looks like a generic file download link
        source: '/file/:id',
        destination: `${apiUrl}/t/:id`, 
      }
    ];
  }
};

export default nextConfig;
