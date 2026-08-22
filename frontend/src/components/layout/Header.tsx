"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LayoutDashboard, Users, Tag, CheckSquare, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Helper to close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 w-full">
        
        {/* Mobile Hamburger Icon (Hidden on Desktop) */}
        <div className="flex items-center md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-lg text-primary tracking-tight">Greentiq CRM</span>
        </div>

        {/* Desktop Page Title (Hidden on Mobile) */}
        <div className="hidden md:block">
          <h1 className="font-semibold text-lg capitalize">
            {pathname === "/" ? "Dashboard" : pathname.replace("/", "")}
          </h1>
        </div>

        {/* User Profile / Right side */}
        <div className="flex items-center gap-4">
          
          {/* 2. Drop the toggle right here! */}
          <ThemeToggle />

          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-semibold text-sm">
            AD
          </div>
        </div>
      </header>

      {/* 📱 MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Dark background overlay */}
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm" 
            onClick={closeMenu}
          ></div>
          
          {/* Slide-in Menu Panel */}
          <div className="relative w-64 max-w-[80%] h-full bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex items-center justify-between border-b border-border">
              <h2 className="text-xl font-bold text-primary tracking-tight">Greentiq</h2>
              <button onClick={closeMenu} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
              <Link href="/" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${pathname === "/" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <LayoutDashboard size={20} /> Dashboard
              </Link>
              
              <Link href="/customers" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${pathname.startsWith("/customers") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Users size={20} /> Contacts
              </Link>

              <Link href="/deals" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${pathname.startsWith("/deals") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Tag size={20} /> Deals
              </Link>

              <Link href="/tasks" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${pathname.startsWith("/tasks") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <CheckSquare size={20} /> Tasks
              </Link>

              <Link href="/settings" onClick={closeMenu} className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${pathname.startsWith("/settings") ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                <Settings size={20} /> Settings
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}