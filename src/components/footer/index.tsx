"use client";
import { Typography, Button, IconButton } from "@material-tailwind/react";
import { useLocale, useTranslations } from "next-intl";

const CURRENT_YEAR = new Date().getFullYear();
const LINKS = ["company", "aboutUs", "team", "products", "blog"];

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="pb-5 p-10 md:pt-10">
      <div className="container flex flex-col mx-auto">
        <div className="flex !w-full py-10 mb-5 md:mb-20 flex-col justify-center !items-center bg-gray-900 max-w-6xl mx-auto rounded-2xl p-5">
          <Typography
            className="text-2xl md:text-3xl text-center font-bold"
            color="white"
          >
            {t("joinNow")}
          </Typography>
          <Typography
            color="white"
            className="md:w-7/12 text-center my-3 !text-base"
          >
            {t("exclusiveOffer")}
          </Typography>
          <div className="flex w-full md:w-fit gap-3 mt-2 flex-col md:flex-row">
            <Button color="white" size="md">
              {t("registerNow")}
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center !justify-between">
          <Typography
            as="a"
            href="https://www.material-tailwind.com"
            target="_blank"
            variant="h6"
            className="text-gray-900"
          >
            {t("materialTailwind")}
          </Typography>
          <ul className="flex justify-center my-4 md:my-0 w-max mx-auto items-center gap-4">
            {LINKS.map((link, index) => (
              <li key={index}>
                <Typography
                  as="a"
                  href="#"
                  variant="small"
                  color="white"
                  className="font-normal !text-gray-700 hover:!text-gray-900 transition-colors"
                >
                  {t(link)}
                </Typography>
              </li>
            ))}
          </ul>
          <div className="flex w-fit justify-center gap-2">
            <IconButton size="sm" color="gray" variant="text">
              <i className="fa-brands fa-twitter text-lg" />
            </IconButton>
            <IconButton size="sm" color="gray" variant="text">
              <i className="fa-brands fa-youtube text-lg" />
            </IconButton>
            <IconButton size="sm" color="gray" variant="text">
              <i className="fa-brands fa-instagram text-lg" />
            </IconButton>
            <IconButton size="sm" color="gray" variant="text">
              <i className="fa-brands fa-github text-lg" />
            </IconButton>
          </div>
        </div>
        <Typography
          color="blue-gray"
          className="text-center mt-12 font-normal !text-gray-700"
        >
          &copy; {CURRENT_YEAR} {t("madeWith")}{" "}
          <a href="https://www.material-tailwind.com" target="_blank">
            {t("materialTailwind")}
          </a>{" "}
          {t("by")}{" "}
          <a href="https://www.creative-tim.com" target="_blank">
            {t("capstoneSpring2025")}
          </a>
          .
        </Typography>
      </div>
    </footer>
  );
}

export default Footer;
