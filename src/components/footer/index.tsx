"use client";
import { Typography, Button, IconButton } from "@material-tailwind/react";
import { useLocale, useTranslations } from "next-intl";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-6 ">
        {/* Logo */}
        <div className="text-2xl font-bold font-mono  text-gray-100 uppercase mt-16">
          STRATEZONE
        </div>
        {/* Links */}
        <div className="flex space-x-6 my-4 md:my-0 ">
          <a
            href="#"
            className="text-gray-300 hover:text-white transition mt-16"
          >
            Additional Link
          </a>
          <a
            href="#"
            className="text-gray-300 hover:text-white transition mt-16"
          >
            Additional Link
          </a>
          <a
            href="#"
            className="text-gray-300 hover:text-white transition mt-16"
          >
            Additional Link
          </a>
        </div>

        {/* Copyright */}
        <div className="text-sm text-gray-400 mt-16">
          © {CURRENT_YEAR} Strate Zone. We love you!
        </div>
      </div>
    </footer>
  );
}
