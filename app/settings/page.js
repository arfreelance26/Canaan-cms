"use client";

import { useState, useEffect } from "react";
import api from "../api";
import { Check, Lock, User, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [currentUsername, setCurrentUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setCurrentUsername(res.data.username);
      setNewUsername(res.data.username);
    } catch (err) {
      console.log(err);
    }
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- setState happens after an await inside fetchMe, not synchronously in the effect body
  useEffect(() => { fetchMe(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    const payload = { current_password: currentPassword };
    if (newUsername && newUsername !== currentUsername) payload.new_username = newUsername;
    if (newPassword) payload.new_password = newPassword;

    if (!payload.new_username && !payload.new_password) {
      setError("Change the username and/or password before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.put("/auth/credentials", payload);
      sessionStorage.setItem("token", res.data.access_token);
      setCurrentUsername(payload.new_username || currentUsername);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Credentials updated successfully.");
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to update credentials. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-4 max-w-xl">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Account
          </span>
        </div>

        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Account
            <span style={{ color: "#85660c" }} className="italic font-normal"> Settings</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-2 max-w-lg leading-relaxed">
            Change your admin login username and/or password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              Current password *
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Required to confirm any change"
                className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              New username
            </label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
              New password
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
          </div>

          {newPassword && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                Confirm new password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-[12px] text-red-600">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-600">
              <Check size={14} className="shrink-0" />
              {success}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving || !currentPassword}
              className={`flex items-center gap-2 text-[12px] font-semibold px-5 py-2.5 rounded-full text-white transition-colors ${isSaving || !currentPassword ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{ background: "#85660c" }}
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={13} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
