import React from "react";
import { MdLogout } from "react-icons/md";
import { useRouter } from "next/navigation";
import { IoArrowBack } from "react-icons/io5";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function AccountSidebar({
  activeTab,
  setActiveTab,
}: SidebarProps) {
  const router = useRouter();
  const MENU_ITEMS = [
    {
      title: "Profile",
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path
            fillRule="evenodd"
            d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      title: "Logout",
      icon: () => <MdLogout />,
    },
  ];

  return (
    <div className="relative flex h-screen w-full max-w-[20rem] flex-col bg-white p-4 text-gray-700 shadow-xl shadow-blue-gray-900/5">
      <div className="flex p-4 my-2 relative">
        <div
          onClick={() => router.push("/")}
          className="absolute left-4 p-1 rounded-full cursor-pointer hover:bg-gray-200 transition-all"
        >
          <IoArrowBack />
        </div>

        <h5 className="block text-xl font-semibold text-blue-gray-900 ml-8">
          Account Management
        </h5>
      </div>

      <nav className="flex flex-col gap-1 p-2 text-base font-normal text-blue-gray-700">
        {MENU_ITEMS.map((item, index) => (
          <div
            key={index}
            role="button"
            onClick={() => setActiveTab(item.title)}
            className={`flex items-center p-3 transition-all rounded-lg hover:bg-blue-gray-50 hover:text-blue-gray-900 cursor-pointer ${
              activeTab === item.title ? "bg-black text-white" : ""
            }`}
          >
            <div
              className={`grid mr-4 text-${activeTab === item.title ? "white" : "black"} place-items-center ${activeTab === item.title ? "" : ""}`}
            >
              {item.icon()}
            </div>
            <span>{item.title}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
