import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {
  LayoutDashboard, Trophy, FileText,
  Users, Truck, Briefcase, FileBadge,
  Anchor, MapPin, DollarSign, Image as ImageIcon, Package,
  Video as VideoIcon, Mail
} from "lucide-react";
import Image from "next/image";
import AuthGuard from "./AuthGuard";
import LogoutButton from "./LogoutButton";
import UserBadge from "./UserBadge";
import UnreadMessagesBadge from "./UnreadMessagesBadge";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "Canaan CMS",
  description: "Canaan Global International — Content Management",
};

const NAV_ITEMS = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/achievements", icon: Trophy, label: "Achievements" },
  { href: "/circulars", icon: FileText, label: "Circulars" },
  { href: "/teams", icon: Users, label: "Teams" },
  { href: "/branches", icon: MapPin, label: "Branches" },
  { href: "/cargos", icon: Package, label: "Cargos" },
  { href: "/services", icon: Briefcase, label: "Services" },
  { href: "/licenses", icon: FileBadge, label: "Licenses" },
  { href: "/exchange-rates", icon: DollarSign, label: "Exchange Rates" },
  { href: "/fleets", icon: Truck, label: "Fleets" },
  { href: "/owner-image", icon: ImageIcon, label: "Owner Image" },
  { href: "/hero-video", icon: VideoIcon, label: "Hero Video" },
  { href: "/messages", icon: Mail, label: "Messages", badge: UnreadMessagesBadge },
];

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="font-sans antialiased min-h-screen flex bg-[#f5f4f0] text-neutral-900">
        <AuthGuard>
          {/* ── SIDEBAR ── */}
          <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 z-10 p-3 gap-3">

          {/* Logo card */}
          <div className="bg-white/80 border border-black/10 rounded-2xl px-5 py-6 flex items-center justify-center shrink-0">
            <div className="relative w-40 h-20 flex items-center justify-center">
              <Image src="/companylogo.png" alt="Canaan Logo" fill sizes="160px" className="object-contain" priority />
            </div>
          </div>

          {/* Nav card */}
          <div className="relative flex-1 bg-white/80 border border-black/10 rounded-2xl overflow-hidden flex flex-col">

            {/* TOP LEFT — label */}
            <div className="absolute top-0 left-0 bg-[#f5f4f0]/95 backdrop-blur-sm px-3 py-2 rounded-br-xl z-10">
              <span className="text-[9px] font-medium tracking-[0.12em] uppercase text-neutral-400">
                Navigation
              </span>
            </div>

            <nav className="flex flex-col gap-1 px-3 pt-10 pb-3 flex-1">
              {NAV_ITEMS.map(({ href, icon: Icon, label, badge: Badge }) => (
                <NavItem key={href} href={href} icon={<Icon size={14} strokeWidth={1.8} />} label={label} badge={Badge && <Badge />} />
              ))}
            </nav>

            {/* BOTTOM — user strip */}
            <div className="border-t border-black/[0.07] px-3 py-3 flex items-center gap-2.5">
              <UserBadge />
              <LogoutButton />
            </div>
          </div>

          {/* Est. badge card */}
          
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-h-screen overflow-y-auto p-3 pl-0">
          <div className="h-full min-h-[calc(100vh-1.5rem)] bg-white/80 border border-black/10 rounded-2xl overflow-x-auto p-8">
            {children}
          </div>
        </main>
        </AuthGuard>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, badge }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-900/[0.05] transition-all duration-200 relative"
    >
      {/* Active indicator — left bar */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 group-hover:h-5 bg-neutral-900 rounded-r-full transition-all duration-200" />

      <span className="shrink-0 transition-colors duration-200 group-hover:text-neutral-900">
        {icon}
      </span>
      <span className="text-[12.5px] font-medium tracking-tight transition-colors duration-200 group-hover:text-neutral-900">
        {label}
      </span>
      {badge}
    </Link>
  );
}