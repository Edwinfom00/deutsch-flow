"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { createUserProfile } from "@/modules/auth/server/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GoogleButton } from "./GoogleButton";

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

const inputClass = (hasError?: boolean) =>
  cn(
    "h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-lg text-sm",
    "focus:bg-white focus:border-gray-900 focus:ring-0 transition-colors",
    hasError && "border-red-300 bg-red-50/30 focus:border-red-400"
  );

function FieldError({ message }: { message?: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="text-xs text-red-500 flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />{message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth({ redirectIfFound: "/dashboard" });
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

  if (isAuthenticated) return null;

  const fields = [
    {
      id: "name" as const,
      label: "Prénom",
      type: "text",
      placeholder: "Marie",
      autoComplete: "given-name",
      icon: User,
      iconClass: "left-3.5",
      extraClass: "pl-10",
    },
    {
      id: "email" as const,
      label: "Adresse email",
      type: "email",
      placeholder: "ton@email.com",
      autoComplete: "email",
      icon: Mail,
      iconClass: "left-3.5",
      extraClass: "pl-10",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Google */}
      <GoogleButton callbackURL="/dashboard" label="S'inscrire avec Google" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-gray-300">ou avec un email</span>
        </div>
      </div>

    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Name + Email */}
      {fields.map((f, i) => (
        <motion.div
          key={f.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
          className="space-y-1.5"
        >
          <Label htmlFor={f.id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {f.label}
          </Label>
          <div className="relative">
            <f.icon className={`absolute ${f.iconClass} top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300`} />
            <Input
              id={f.id}
              type={f.type}
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              {...register(f.id)}
              className={cn(f.extraClass, inputClass(!!errors[f.id]))}
            />
          </div>
          <FieldError message={errors[f.id]?.message} />
        </motion.div>
      ))}

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12 }}
        className="space-y-1.5"
      >
        <Label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("password")}
            className={cn("pl-10 pr-10", inputClass(!!errors.password))}
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label={showPwd ? "Masquer" : "Afficher"}
          >
            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <FieldError message={errors.password?.message} />
      </motion.div>

      {/* Confirm password */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.18 }}
        className="space-y-1.5"
      >
        <Label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id="confirmPassword"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            {...register("confirmPassword")}
            className={cn("pl-10", inputClass(!!errors.confirmPassword))}
          />
        </div>
        <FieldError message={errors.confirmPassword?.message} />
      </motion.div>

      {/* Global error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
        className="w-full h-11 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1 shadow-sm shadow-emerald-200"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Création du compte...</>
        ) : (
          "Créer mon compte gratuitement"
        )}
      </motion.button>
    </motion.form>
    </div>
  );
}
