"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { createUserProfile } from "@/modules/auth/server/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    name: z.string().min(2, "Minimum 2 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Minimum 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
      callbackURL: "/onboarding",
    });
    if (result.error) {
      setError(
        result.error.code === "USER_ALREADY_EXISTS"
          ? "Un compte existe déjà avec cet email"
          : "Une erreur est survenue. Réessaie."
      );
      return;
    }
    if (result.data?.user?.id) await createUserProfile(result.data.user.id);
    router.push("/onboarding");
  };

  const fieldClass = (hasError?: boolean) =>
    cn(
      "h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/20",
      hasError && "border-red-300"
    );

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Prénom</Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="name" placeholder="Marie" autoComplete="given-name" {...register("name")}
            className={cn("pl-10", fieldClass(!!errors.name))} />
        </div>
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">Adresse email</Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="email" type="email" placeholder="ton@email.com" autoComplete="email" {...register("email")}
            className={cn("pl-10", fieldClass(!!errors.email))} />
        </div>
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="password" type={showPwd ? "text" : "password"} placeholder="••••••••"
            autoComplete="new-password" {...register("password")}
            className={cn("pl-10 pr-10", fieldClass(!!errors.password))} />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      {/* Confirm */}
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input id="confirmPassword" type={showPwd ? "text" : "password"} placeholder="••••••••"
            autoComplete="new-password" {...register("confirmPassword")}
            className={cn("pl-10", fieldClass(!!errors.confirmPassword))} />
        </div>
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-red-50 border border-red-200 px-4 py-3"
        >
          <p className="text-sm text-red-600">{error}</p>
        </motion.div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm shadow-emerald-200 hover:shadow-emerald-300 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Création du compte...</>
        ) : (
          "Créer mon compte gratuitement"
        )}
      </button>
    </motion.form>
  );
}
