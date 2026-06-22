"use client";

import { useState, useEffect } from "react";
import api from "./api";

const POLL_INTERVAL_MS = 20000;

export default function UnreadMessagesBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/contact/");
      setUnreadCount(res.data.filter((m) => !m.is_read).length);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after an await inside fetchUnreadCount, not synchronously in the effect body
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span
      className="ml-auto shrink-0 text-[10px] font-bold text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
      style={{ background: "#85660c" }}
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  );
}
