import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { userProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  const profile = await db.query.userProfile.findFirst({
    where: eq(userProfile.userId, session.user.id),
  });

  if (!profile?.onboardingCompleted) redirect("/onboarding");

  return (
    <SidebarProvider>
      <AppSidebar
        userName={session.user.name}
        userEmail={session.user.email}
        level={profile?.level ?? "A0"}
      />
      <SidebarInset className="bg-[#f9f9f9] min-h-screen">
        <DashboardHeader
          userName={session.user.name}
          level={profile?.level ?? "A0"}
          streak={profile?.currentStreak ?? 0}
          totalXp={profile?.totalXp ?? 0}
        />
        <main className="flex-1 min-h-[calc(100vh-3.25rem)]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
