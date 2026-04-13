"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Flame, Zap } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/dashboard/learn": "Leçons",
  "/dashboard/review": "Révisions",
  "/dashboard/vocabulary": "Vocabulaire",
  "/dashboard/speak": "Zone de Parole",
  "/dashboard/streak": "Streak & XP",
  "/dashboard/badges": "Badges",
  "/dashboard/league": "Classement",
  "/dashboard/settings": "Paramètres",
};

interface Props {
  userName: string;
  level: string;
  streak: number;
  totalXp: number;
}

export function DashboardHeader({ level, streak, totalXp }: Props) {
  const pathname = usePathname();
  const pageLabel = ROUTE_LABELS[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-13 items-center gap-3 border-b border-gray-200/60 bg-white/80 backdrop-blur-md px-4">
      {/* Sidebar toggle */}
      <SidebarTrigger className="h-7 w-7 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors -ml-1 shrink-0" />

      <Separator orientation="vertical" className="h-4 bg-gray-200" />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-400 font-medium">DeutschFlow</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-semibold">{pageLabel}</span>
      </div>

      {/* Right — stats chips */}
      <div className="ml-auto flex items-center gap-2">
        {/* Level badge */}
        <div className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 bg-gray-900 rounded-md">
          <span className="text-white text-[11px] font-bold">{level}</span>
        </div>

        <Separator orientation="vertical" className="h-4 bg-gray-200 hidden sm:block" />

        {/* Streak */}
        <div className="flex items-center gap-1.5 h-7 px-2.5 border border-gray-100 rounded-md bg-white">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[12px] font-bold text-gray-900">{streak}</span>
          <span className="text-[11px] text-gray-400 hidden sm:inline">jours</span>
        </div>

        {/* XP */}
        <div className="flex items-center gap-1.5 h-7 px-2.5 border border-gray-100 rounded-md bg-white">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-[12px] font-bold text-gray-900">{totalXp.toLocaleString()}</span>
          <span className="text-[11px] text-gray-400 hidden sm:inline">XP</span>
        </div>
      </div>
    </header>
  );
}
