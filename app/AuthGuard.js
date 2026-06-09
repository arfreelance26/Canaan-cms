"use client";

import { useState, useEffect } from "react";
import { Lock, User } from "lucide-react";
import Image from "next/image";
import api from "./api";

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      
      const res = await api.post("/auth/login", params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      sessionStorage.setItem("token", res.data.access_token);
      setIsAuthenticated(true);
      setError("");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f4f0] p-4">
        <div className="max-w-sm w-full bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 flex flex-col items-center">
          <div className="w-56 h-20 relative mb-6">
            <Image src="/companylogo.png" alt="Company Logo" fill sizes="224px" className="object-contain" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 mb-2">Canaan CMS</h1>
          <p className="text-xs text-neutral-500 mb-6 text-center">Please enter the admin password to continue.</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-3">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
                autoFocus
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f5f4f0] rounded-xl pl-10 pr-4 py-3 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 outline-none border border-transparent focus:border-neutral-300 transition-colors"
              />
            </div>
            {error && <p className="text-[11px] text-red-500 font-medium px-1">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white text-sm font-semibold mt-2 transition-opacity hover:opacity-90"
              style={{ background: "#85660c" }}
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return children;
}
