"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, Mic, Zap, Trophy,
  Settings, ChevronRight, Flame, LogOut, GraduationCap, Upload, BarChart2, Bot, Wrench,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton,
  SidebarMenuSubItem, SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";

const nav = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        title: "Apprendre",
        icon: BookOpen,
        children: [
          { title: "Leçons", href: "/learn" },
          { title: "Révisions", href: "/review" },
          { title: "Vocabulaire", href: "/vocabulary" },
        ],
      },
      { title: "Zone de Parole", href: "/speak", icon: Mic },
      { title: "Tuteur IA", href: "/chat", icon: Bot, badge: "repair" },
    ],
  },
  {
    label: "Progression",
    items: [
      { title: "Analytiques", href: "/analytics", icon: BarChart2 },
      { title: "Streak & XP", href: "/streak", icon: Flame },
      { title: "Badges", href: "/badges", icon: Trophy },
      { title: "Classement", href: "/league", icon: Zap },
    ],
  },
  // Aufgabe injecté dynamiquement dans le JSX si éligible
  {
    label: "Compte",
    items: [
      {
        title: "Importer",
        icon: Upload,
        children: [
          { title: "Upload", href: "/import" },
          { title: "Exercices", href: "/import/exercises" },
          { title: "Modellsatz", href: "/import/modellsatz" },
          { title: "Grammaire", href: "/import/grammar" },
          { title: "Communauté", href: "/import/community" },
        ],
      },
      { title: "Paramètres", href: "/settings", icon: Settings },
    ],
  },
];

interface Props { userName: string; userEmail: string; level: string; totalXp: number }

const XP_PER_LEVEL: Record<string, number> = {
  A0: 200, A1: 500, A2: 800, B1: 1200, B2: 1800, C1: 2500, C2: 9999,
};

export function AppSidebar({ userName, userEmail, level, totalXp }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const isAufgabeEligible = totalXp >= (XP_PER_LEVEL[level] ?? 9999);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <Sidebar collapsible="icon" className="[--sidebar-width:255px]">

      {/* Logo */}
      <SidebarHeader className="px-3 pt-4 pb-3 border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="rounded-md" render={
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-md bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/30">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-sm text-sidebar-foreground tracking-tight">DeutschFlow</span>
                  <span className="text-[11px] text-sidebar-foreground/40 mt-0.5">Niveau {level}</span>
                </div>
              </Link>
            } />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-3 px-2">
        {nav.map((group, gi) => (
          <SidebarGroup key={gi} className="mb-2 p-0">
            {group.label && (
              <p className="text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-[0.15em] px-2 mb-1.5">
                {group.label}
              </p>
            )}
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {                const Icon = item.icon;

                if ("children" in item && item.children) {
                  const isGroupActive = item.children.some((c) => pathname === c.href);
                  return (
                    <Collapsible key={item.title} defaultOpen={isGroupActive} className="group/collapsible">
                      <SidebarMenuItem>
                        <CollapsibleTrigger render={
                          <SidebarMenuButton
                            isActive={isGroupActive}
                            className="rounded-md h-9 text-[13px] font-medium"
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span className="flex-1">{item.title}</span>
                            <ChevronRight className="h-3.5 w-3.5 opacity-40 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        } />
                        <CollapsibleContent>
                          <SidebarMenuSub className="ml-4 border-l border-sidebar-border pl-3 mt-0.5 space-y-0.5">
                            {item.children.map((child) => (
                              <SidebarMenuSubItem key={child.href}>
                                <SidebarMenuSubButton
                                  isActive={pathname === child.href}
                                  className={cn(
                                    "text-[12px] rounded-md h-7",
                                    pathname === child.href && "font-semibold"
                                  )}
                                  render={<Link href={child.href}>{child.title}</Link>}
                                />
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                const href = (item as { href: string }).href;
                const isActive = pathname === href;
                const badge = (item as { badge?: string }).badge;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className={cn("rounded-md h-9 text-[13px] font-medium", isActive && "font-semibold")}
                      render={
                        <Link href={href} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1">{item.title}</span>
                          {badge === "repair" && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/15 text-amber-500 border border-amber-500/20 shrink-0">
                              <Wrench className="h-2.5 w-2.5" />
                              bêta
                            </span>
                          )}
                        </Link>
                      }
                    />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}

        {/* Aufgabe — visible uniquement si XP suffisant pour passer au niveau suivant */}
        {isAufgabeEligible && (
          <SidebarGroup className="mb-2 p-0">
            <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-[0.15em] px-2 mb-1.5">
              Passage de niveau
            </p>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/aufgabe"}
                  className={cn("rounded-md h-9 text-[13px] font-medium text-amber-400 hover:text-amber-300", pathname === "/aufgabe" && "font-semibold")}
                  render={
                    <Link href="/aufgabe" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 shrink-0" />
                      <span>Aufgabe · {level} → suivant</span>
                      <span className="ml-auto text-[9px] font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-sm">PRÊT</span>
                    </Link>
                  }
                />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 py-3 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="rounded-md w-full" render={
              <div className="flex items-center gap-2.5 w-full min-w-0">
                <div className="h-7 w-7 rounded-md bg-sidebar-accent flex items-center justify-center shrink-0 text-[12px] font-bold text-sidebar-foreground">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col leading-none flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-sidebar-foreground truncate">{userName}</span>
                  <span className="text-[11px] text-sidebar-foreground/40 truncate mt-0.5">{userEmail}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-sidebar-foreground/30 hover:text-sidebar-foreground/80 transition-colors shrink-0"
                  title="Se déconnecter"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            } />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
