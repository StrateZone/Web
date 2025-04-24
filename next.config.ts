import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["res.cloudinary.com", "i.pinimg.com"],

    // Bạn có thể thêm các hostname khác nếu cần
    // domains: ['res.cloudinary.com', 'example.com', 'another-cdn.com'],
  },
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint khi build
  },

  // typescript: {
  //   ignoreBuildErrors: true, // Chỉ dùng tạm thời, sau đó sửa lỗi
  // },
};

module.exports = withNextIntl(nextConfig);
