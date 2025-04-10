"use client";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 ">
        {/* Logo */}
        <div className="text-2xl font-bold font-mono  text-gray-100 uppercase mt-16">
          STRATEZONE
        </div>
        <div className="text-sm text-gray-400 mt-16">
          © {CURRENT_YEAR} Strate Zone. Cảm ơn bạn quý khách!
        </div>
      </div>
    </footer>
  );
}
