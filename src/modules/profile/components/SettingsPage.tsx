"use client";

import { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { CEFER_LEVELS, LEVEL_LABELS, SECTOR_LABELS, GOAL_LABELS } from "@/types";
import type { CEFRLevel, Sector, Goal } from "@/types";
import { updateProfileSettings, updateUserName } from "../server/settings.actions";

type Settings = {
  name: string; email: string;
  level: CEFRLevel; sector: Sector; goal: Goal; dailyGoalMinutes: number;
};

const profileSchema = z.object({ name: z.string().min(1, "Le prénom est requis") });
const learningSchema = z.object({
  level: z.enum(["A0","A1","A2","B1","B2","C1","C2"] as const),
  sector: z.enum(["IT","BUSINESS","SANTE","DROIT","TOURISME","QUOTIDIEN","AUTRE"] as const),
  goal: z.enum(["VOYAGE","TRAVAIL","ETUDES","CERTIFICATION","LOISIR"] as const),
  dailyGoalMinutes: z.number().int().positive(),
});

type ProfileForm = z.infer<typeof profileSchema>;
type LearningForm = z.infer<typeof learningSchema>;

const card = "bg-white border border-gray-200/70 rounded-md p-5 space-y-4";
const sectionTitle = "text-[10px] font-semibold text-gray-400 uppercase tracking-wider";
const fieldLabel = "text-xs font-medium text-gray-600";

export function SettingsPage({ settings }: { settings: Settings }) {
  return (
    <div className="p-5 max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-[15px] font-semibold text-gray-900">Paramètres</h1>
        <p className="text-xs text-gray-400 mt-0.5">Gère ton profil et tes préférences d&apos;apprentissage</p>
      </div>
      <ProfileSection name={settings.name} email={settings.email} />
      <LearningSection
        level={settings.level} sector={settings.sector}
        goal={settings.goal} dailyGoalMinutes={settings.dailyGoalMinutes}
      />
    </div>
  );
}

function ProfileSection({ name, email }: { name: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name },
  });

  const onSubmit = (data: ProfileForm) => {
    startTransition(async () => {
      try {
        await updateUserName(data.name);
        toast.success("Profil mis à jour");
      } catch {
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <div className={card}>
      <p className={sectionTitle}>Profil</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className={fieldLabel}>Prénom</Label>
          <Input id="name" type="text" {...register("name")} className="h-9 text-sm rounded-md" />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className={fieldLabel}>Email</Label>
          <Input id="email" type="email" value={email} readOnly disabled
            className="h-9 text-sm rounded-md bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="sm" className="h-8 text-xs rounded-md">
            {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Sauvegarde...</> : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function LearningSection({ level, sector, goal, dailyGoalMinutes }: {
  level: CEFRLevel; sector: Sector; goal: Goal; dailyGoalMinutes: number;
}) {
  const [isPending, startTransition] = useTransition();
  const { control, handleSubmit } = useForm<LearningForm>({
    resolver: zodResolver(learningSchema),
    defaultValues: { level, sector, goal, dailyGoalMinutes },
  });

  const onSubmit = (data: LearningForm) => {
    startTransition(async () => {
      try {
        await updateProfileSettings(data);
        toast.success("Préférences mises à jour");
      } catch {
        toast.error("Une erreur est survenue");
      }
    });
  };

  return (
    <div className={card}>
      <p className={sectionTitle}>Apprentissage</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Niveau */}
        <div className="space-y-1.5">
          <Label className={fieldLabel}>Niveau actuel</Label>
          <Controller control={control} name="level" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-9  text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CEFER_LEVELS.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>
                    {lvl} — {LEVEL_LABELS[lvl]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </div>

        {/* Secteur */}
        <div className="space-y-1.5">
          <Label className={fieldLabel}>Secteur</Label>
          <Controller control={control} name="sector" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-9 rounded-md text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(SECTOR_LABELS) as [Sector, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </div>

        {/* Objectif */}
        <div className="space-y-1.5">
          <Label className={fieldLabel}>Objectif</Label>
          <Controller control={control} name="goal" render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-9 rounded-md text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </div>

        {/* Rythme */}
        <div className="space-y-1.5">
          <Label className={fieldLabel}>Rythme quotidien</Label>
          <Controller control={control} name="dailyGoalMinutes" render={({ field }) => (
            <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
              <SelectTrigger className="w-full h-9 rounded-md text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 30].map((min) => (
                  <SelectItem key={min} value={String(min)}>{min} min / jour</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )} />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} size="sm" className="h-8 text-xs rounded-md">
            {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Sauvegarde...</> : "Sauvegarder"}
          </Button>
        </div>
      </form>
    </div>
  );
}
