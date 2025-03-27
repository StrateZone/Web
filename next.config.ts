const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.shopify.com", "phatdatbinhthoi.com.vn", "lienhiepthanh.com"], // Thêm tất cả các domain cần thiết
  },
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint khi build
  },
  // typescript: {
  //   ignoreBuildErrors: true, // Chỉ dùng tạm thời, sau đó sửa lỗi
  // },
};

module.exports = withNextIntl(nextConfig);
