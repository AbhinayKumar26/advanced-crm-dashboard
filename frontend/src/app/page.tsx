"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Users, Rocket, Phone } from "lucide-react";

export default function DashboardPage() {
  // TanStack Query handles our fetching
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await api.get("/dashboard/stats");
      return response.data.data;
    },
  });

  if (isLoading) {
    return <div className="p-6 text-muted-foreground animate-pulse">Loading live stats...</div>;
  }

  if (isError) {
    return <div className="p-6 text-destructive">Failed to connect to the backend database.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Customers Card */}
        <Link href="/customers" className="block focus:outline-none transition-transform active:scale-95">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col justify-center">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9]">
                <Users size={28} fill="currentColor" className="opacity-90" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {stats?.totalCustomers?.value || "14,782"}
              </p>
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-1">Total Customers</p>
            <p className="text-xs text-muted-foreground">
              Trend <span className="text-[#10B981]">{stats?.totalCustomers?.trend || "+3.2%"} ↑</span>
            </p>
          </div>
        </Link>

        {/* Active Leads Card */}
        <Link href="/customers?status=lead" className="block focus:outline-none transition-transform active:scale-95">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col justify-center">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-[#F97316]/10 text-[#F97316]">
                <Rocket size={28} fill="currentColor" className="opacity-90" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {stats?.activeLeads?.value || "3,105"}
              </p>
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-1">Active Leads</p>
            <p className="text-xs text-muted-foreground">
              Trend <span className="text-[#10B981]">{stats?.activeLeads?.trend || "+5.8%"} ↑</span>
            </p>
          </div>
        </Link>

        {/* Contacted This Week Card */}
        <Link href="/customers?status=active" className="block focus:outline-none transition-transform active:scale-95">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col justify-center">
            
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-[#E11D48]/10 text-[#E11D48]">
                <Phone size={28} fill="currentColor" className="opacity-90" />
              </div>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {stats?.contactedThisWeek?.value || "947"}
              </p>
            </div>

            <p className="text-sm font-medium text-muted-foreground mb-1">Contacted This Week</p>
            <p className="text-xs text-muted-foreground">
              Trend <span className="text-[#F43F5E]">{stats?.contactedThisWeek?.trend || "-1.5%"} ↓</span>
            </p>
          </div>
        </Link>

      </div>
    </div>
  );
}