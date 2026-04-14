"use client";

import { motion } from "framer-motion";
import { Trophy, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { getLeagueData } from "../server/league.actions";

type LeagueData = Awaited<ReturnType<typeof getLeagueData>>;
type Member = LeagueData["members"][number];

const card = "bg-white border border-gray-200/70 rounded-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]";

const rankStyle = (rank: number) => {
  if (rank === 1) return { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-200" };
  if (rank === 2) return { bg: "bg-gray-100",    text: "text-gray-500",    border: "border-gray-200" };
  if (rank === 3) return { bg: "bg-orange-50",   text: "text-orange-600",  border: "border-orange-200" };
  return           { bg: "bg-gray-50",    text: "text-gray-400",    border: "border-gray-100" };
};

export function LeaguePage({ data }: { data: LeagueData }) {
  const { members, myUserId, myRank, myWeekXp, lastWeekXp, lastWeekRank, week } = data;

  const xpDiff = myWeekXp - lastWeekXp;
  const rankDiff = lastWeekRank && myRank ? lastWeekRank - myRank : null;

  return (
    <div className="p-5 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[15px] font-semibold text-gray-900">Classement</h1>
        <p className="text-xs text-gray-400 mt-0.5">Semaine {week} · {members.length} participant{members.length > 1 ? "s" : ""}</p>
      </motion.div>

      {/* Mes stats semaine */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Mon rang",
            value: myRank ? `#${myRank}` : "—",
            sub: rankDiff !== null
              ? rankDiff > 0 ? `+${rankDiff} places` : rankDiff < 0 ? `${rankDiff} places` : "Stable"
              : "Cette semaine",
            icon: Trophy,
            trend: rankDiff !== null ? (rankDiff > 0 ? "up" : rankDiff < 0 ? "down" : "same") : "same",
            iconBg: "bg-amber-50", iconColor: "text-amber-500",
          },
          {
            label: "XP cette semaine",
            value: myWeekXp.toLocaleString("fr-FR"),
            sub: xpDiff > 0 ? `+${xpDiff} vs semaine passée` : "vs semaine passée",
            icon: Zap,
            trend: xpDiff > 0 ? "up" : xpDiff < 0 ? "down" : "same",
            iconBg: "bg-yellow-50", iconColor: "text-yellow-500",
          },
          {
            label: "Participants",
            value: members.length,
            sub: "dans ta ligue",
            icon: TrendingUp,
            trend: "same" as const,
            iconBg: "bg-blue-50", iconColor: "text-blue-500",
          },
        ].map((s, i) => {
          const Icon = s.icon;
          const TrendIcon = s.trend === "up" ? TrendingUp : s.trend === "down" ? TrendingDown : Minus;
          const trendColor = s.trend === "up" ? "text-emerald-500" : s.trend === "down" ? "text-red-400" : "text-gray-300";
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }} className={card + " p-4"}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
                <div className={`h-6 w-6 rounded-md ${s.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${s.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 leading-none">{s.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                <p className="text-[11px] text-gray-400">{s.sub}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Podium top 3 */}
      {members.length >= 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-3 py-4">
          {[members[1], members[0], members[2]].map((m, i) => {
            const heights = ["h-20", "h-28", "h-16"];
            const ranks = [2, 1, 3];
            const rank = ranks[i];
            const rs = rankStyle(rank);
            const isMe = m.userId === myUserId;
            return (
              <div key={m.userId} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "h-9 w-9 rounded-md flex items-center justify-center text-sm font-bold border",
                  isMe ? "bg-gray-900 text-white border-gray-900" : `${rs.bg} ${rs.text} ${rs.border}`
                )}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className={cn(
                  "w-20 rounded-t-md flex flex-col items-center justify-end pb-2 border",
                  heights[i], rs.bg, rs.border
                )}>
                  <span className={`text-lg font-black ${rs.text}`}>#{rank}</span>
                </div>
                <p className="text-[10px] text-gray-600 font-medium truncate max-w-20 text-center">{m.name}</p>
                <p className="text-[10px] text-gray-400">{m.weekXp} XP</p>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Classement complet */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className={card + " overflow-hidden"}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-600">Classement complet</p>
          <span className="text-[10px] text-gray-400">XP cette semaine</span>
        </div>
        <div className="divide-y divide-gray-50">
          {members.map((m, i) => (
            <MemberRow key={m.userId} member={m} isMe={m.userId === myUserId} index={i} />
          ))}
          {members.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-gray-400">
              Aucun participant cette semaine encore.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function MemberRow({ member, isMe, index }: { member: Member; isMe: boolean; index: number }) {
  const rs = rankStyle(member.rank);
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors",
        isMe && "bg-gray-50"
      )}
    >
      {/* Rang */}
      <div className={cn(
        "h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-bold border shrink-0",
        rs.bg, rs.text, rs.border
      )}>
        {member.rank <= 3 ? (
          member.rank === 1 ? <Trophy className="h-3 w-3" /> : member.rank
        ) : member.rank}
      </div>

      {/* Avatar */}
      <div className={cn(
        "h-8 w-8 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
        isMe ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"
      )}>
        {member.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-semibold truncate", isMe ? "text-gray-900" : "text-gray-700")}>
            {member.name}
            {isMe && <span className="ml-1.5 text-[10px] font-bold text-gray-400">(toi)</span>}
          </p>
        </div>
        <p className="text-[10px] text-gray-400">Niveau {member.level}</p>
      </div>

      {/* XP */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-900">{member.weekXp.toLocaleString("fr-FR")}</p>
        <p className="text-[10px] text-gray-400">XP</p>
      </div>
    </motion.div>
  );
}
