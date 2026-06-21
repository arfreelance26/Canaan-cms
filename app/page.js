"use client";

import { useEffect, useState } from "react";
import api from "./api";
import {
  Trophy, FileText, ShieldCheck, Layers, Users, Package, MapPin, DollarSign, Truck, Image as ImageIcon, Video as VideoIcon
} from "lucide-react";
import Link from "next/link";

const CARDS = [
  { label: "Achievements", endpoint: "/achievements/", icon: Trophy, suffix: "milestones" },
  { label: "Circulars", endpoint: "/circulars/", icon: FileText, suffix: "documents" },
  { label: "Licenses", endpoint: "/licenses/", icon: ShieldCheck, suffix: "credentials" },
  { label: "Services", endpoint: "/services/", icon: Layers, suffix: "offerings" },
  { label: "Team Members", endpoint: "/teams/", icon: Users, suffix: "people" },
  { label: "Branches", endpoint: "/branches/", icon: MapPin, suffix: "locations" },
  { label: "Cargo Categories", endpoint: "/cargos/", icon: Package, suffix: "categories" },
  { label: "Exchange Rates", endpoint: "/exchange-rates/", icon: DollarSign, suffix: "rates" },
  { label: "Fleets", endpoint: "/fleets/", icon: Truck, suffix: "vehicles" },
  { label: "Owner Image", endpoint: "/owner-image/", icon: ImageIcon, suffix: "profile" },
  { label: "Hero Video", endpoint: "/hero-video/", icon: VideoIcon, suffix: "promo video" },
];

export default function Home() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    CARDS.forEach(async ({ label, endpoint }) => {
      try {
        const res = await api.get(endpoint);
        setCounts((prev) => ({ ...prev, [label]: Array.isArray(res.data) ? res.data.length : 1 }));
      } catch {
        setCounts((prev) => ({ ...prev, [label]: "—" }));
      }
    });
  }, []);

  return (
    <section className="relative bg-[#f5f4f0] font-sans flex flex-col p-4 sm:p-5 gap-3 min-h-screen">

      {/* ── HEADER CARD ── */}
      <div className="relative rounded-2xl overflow-hidden bg-white px-6 py-8 sm:px-10 sm:py-10 border border-black/5">
        <div className="absolute top-0 left-0 bg-[#f5f4f0] px-5 py-3 rounded-br-2xl">
          <span className="text-[10px] font-medium tracking-[0.12em] uppercase text-neutral-400">
            Admin Panel
          </span>
        </div>
        <div className="absolute top-0 right-0 bg-[#f5f4f0] px-5 py-3 rounded-bl-2xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-neutral-900 tracking-tight">
            System active
          </span>
        </div>
        <div className="mt-8">
          <h1 className="text-3xl sm:text-[2.6rem] font-bold tracking-[-0.03em] leading-[1.1]">
            Welcome back,<br />
            <span style={{ color: "#85660c" }} className="italic font-normal">Canaan Global.</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-3 max-w-sm leading-relaxed">
            Manage your logistics content, team, and credentials from one place.
          </p>
        </div>
      </div>

      {/* ── COMBINED MODULES GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {CARDS.map(({ label, endpoint, icon: Icon, suffix }, i) => (
          <Link
            key={label}
            href={endpoint}
            className="group relative rounded-2xl bg-white border border-black/5 hover:border-[#85660c]/30 overflow-hidden flex flex-col p-6 transition-all duration-300 hover:shadow-xl hover:shadow-[#85660c]/5 hover:-translate-y-1"
          >
            {/* Top section */}
            <div className="flex justify-between items-start mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: "rgba(133,102,12,0.06)", color: "#85660c" }}
              >
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-300">
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Middle section (Count) */}
            <div className="flex flex-col gap-1">
              <span className="text-4xl font-bold tracking-[-0.04em] text-neutral-900 leading-none">
                {counts[label] ?? "—"}
              </span>
              <span
                className="text-[10px] font-semibold tracking-[0.12em] uppercase mt-1"
                style={{ color: "#85660c" }}
              >
                {suffix}
              </span>
            </div>

            {/* Bottom section (Link) */}
            <div className="mt-8 flex items-center justify-between border-t border-neutral-100 pt-4">
              <span className="text-sm font-semibold text-neutral-900">
                {label}
              </span>
              <span className="text-[11px] font-semibold text-neutral-400 group-hover:text-[#85660c] transition-colors flex items-center gap-1">
                Manage <span className="text-base leading-none translate-y-[0.5px]">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section >
  );
}