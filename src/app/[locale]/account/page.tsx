"use client";
import React, { useEffect, useState } from "react";

import AccountSidebar from "@/components/sidebar/account_sidebar";
import TabContent from "@/components/sidebar/account_tab_content";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status]);
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="flex">
      <AccountSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <TabContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
