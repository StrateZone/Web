import React from "react";
import { signOut } from "next-auth/react";

import UserProfile from "../profile/user_profile";
import BasicDialog from "../dialog";

type TabContentProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

export default function TabContent({
  activeTab,
  setActiveTab,
}: TabContentProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleLogout = () => {
    signOut();
  };

  const handleCancel = () => {
    setActiveTab("Profile");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Profile":
        return <UserProfile />;
      case "Logout":
        return (
          <BasicDialog
            dialogHeader="Logout"
            dialogBody="You want to logout???"
            onConfirm={handleLogout}
            onCancel={handleCancel}
            open={isDialogOpen}
            setOpen={setIsDialogOpen}
          />
        );
      default:
        return (
          <div className="flex justify-center items-center text-gray-500 h-screen">
            <p>No content available for this tab.</p>
          </div>
        );
    }
  };

  return <>{renderContent()}</>;
}
