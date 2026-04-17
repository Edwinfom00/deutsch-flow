import { redirect } from "next/navigation";
import { getDashboardData } from "@/modules/learn/server/dashboard.actions";
import { getWordOfDay } from "@/modules/learn/server/word-of-day.actions";
import { getPhraseDuJour } from "@/modules/learn/server/phrase-du-jour.actions";
import { DashboardClient } from "@/modules/learn/components/DashboardClient";

export default async function DashboardPage() {
  const [data, word, phrase] = await Promise.all([
    getDashboardData(),
    getWordOfDay().catch(() => null),
    getPhraseDuJour().catch(() => null),
  ]);
  if (!data) redirect("/login");
  return <DashboardClient data={data} wordOfDay={word} phraseDuJour={phrase} />;
}
