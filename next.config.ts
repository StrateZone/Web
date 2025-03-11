const createNextIntlPlugin = require("next-intl/plugin");

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.shopify.com", "phatdatbinhthoi.com.vn", "lienhiepthanh.com"], // Thêm tất cả các domain cần thiết
  },
};

module.exports = withNextIntl(nextConfig);
