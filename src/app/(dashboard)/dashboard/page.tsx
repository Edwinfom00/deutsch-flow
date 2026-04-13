import { redirect } from "next/navigation";
import { getDashboardData } from "@/modules/learn/server/dashboard.actions";
import { DashboardClient } from "@/modules/learn/components/DashboardClient";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) redirect("/login");
  return <DashboardClient data={data} />;
}
