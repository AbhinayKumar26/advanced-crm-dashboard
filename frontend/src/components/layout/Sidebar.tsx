"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Tag, CheckSquare, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contacts", href: "/customers", icon: Users },
    { name: "Deals", href: "/deals", icon: Tag },
    { name: "Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-[#2e364f] h-full flex flex-col shrink-0 hidden md:flex">
      
      {/* 🚀 Main Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith("/customers") && item.name === "Contacts");
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                /* YAHAN FIX HAI: flex items-center gap-3 se icon aur text perfect align honge */
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive 
                  ? "bg-[#1e293b]/80 text-[#3b82f6] shadow-sm" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1f2e]"
                }
              `}
            >
              <item.icon className={`h-5 w-5 ${isActive ? "text-[#3b82f6]" : "opacity-70"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* App Version Info (Optional at bottom) */}
      <div className="p-6 text-xs text-[#2e364f] font-medium">
        v1.0.0 - Development
      </div>
    </aside>
  );
}