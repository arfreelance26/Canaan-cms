"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      title="Sign Out"
      className="w-7 h-7 rounded-full bg-red-50/80 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors"
    >
      <LogOut size={12} className="text-red-500 ml-0.5" />
    </button>
  );
}
