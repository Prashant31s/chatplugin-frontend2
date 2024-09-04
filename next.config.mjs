/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:false
};

module.exports = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig;
