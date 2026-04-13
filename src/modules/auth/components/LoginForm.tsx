"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth({ redirectIfFound: "/dashboard" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    const result = await signIn.email({
      email: data.email,
      password: data.password,
      callbackURL: "/dashboard",
    });
    if (result.error) { setError("Email ou mot de passe incorrect"); return; }
    router.push("/dashboard");
    router.refresh();
  };

  if (isAuthenticated) return null;

  return (
    <motion.form
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
    >
      {/* Email */}
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Adresse email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id="email"
            type="email"
            placeholder="ton@email.com"
            autoComplete="email"
            {...register("email")}
            className={cn(
              "pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-lg text-sm",
              "focus:bg-white focus:border-gray-900 focus:ring-0 transition-colors",
              errors.email && "border-red-300 bg-red-50/30 focus:border-red-400"
            )}
          />
        </div>
        <AnimatePresence>
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />{errors.email.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("password")}
            className={cn(
              "pl-10 pr-10 h-11 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-300 rounded-lg text-sm",
              "focus:bg-white focus:border-gray-900 focus:ring-0 transition-colors",
              errors.password && "border-red-300 bg-red-50/30"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <AnimatePresence>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />{errors.password.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

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
        className="w-full h-11 rounded-lg bg-gray-900 hover:bg-gray-800 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
      >
        {isSubmitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Connexion...</>
        ) : (
          "Se connecter"
        )}
      </motion.button>
    </motion.form>
  );
}
