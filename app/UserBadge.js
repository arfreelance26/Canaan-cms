"use client";

import { useState, useEffect } from "react";
import api from "./api";

export default function UserBadge() {
  const [username, setUsername] = useState("");

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setUsername(res.data.username);
    } catch (err) {
      console.log(err);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after an await inside fetchMe, not synchronously in the effect body
  useEffect(() => { fetchMe(); }, []);

  return (
    <>
      <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center shrink-0">
        <span className="text-[11px] font-bold text-white">{username ? username[0].toUpperCase() : "A"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-neutral-900 tracking-tight leading-none truncate">
          {username || "Admin"}
        </p>
        <p className="text-[9px] text-neutral-400 tracking-tight mt-0.5">Admin</p>
      </div>
    </>
  );
}
