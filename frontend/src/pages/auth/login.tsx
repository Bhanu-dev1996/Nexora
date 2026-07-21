import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { stagger } from "@/components/auth/animations"
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton"
import { useAuthStore } from "@/stores/auth-store"
import { loginSchema, type LoginFormData } from "@/lib/validators"
import { ROUTES } from "@/lib/constants"

function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <motion.div variants={stagger.item} className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-[13px]">
        {label}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success("Welcome back!", {
        description: "You've been signed in successfully.",
      })
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch {
      // handled by store
    }
  }

  return (
    <motion.div
      variants={stagger.container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={stagger.item} className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
          >
            <Alert variant="destructive">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="name@company.com"
            autoComplete="email"
            disabled={isLoading}
            className="h-9 text-[13px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
            {...register("email", { onChange: () => clearError() })}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={isLoading}
              className="h-9 pr-9 text-[13px] transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              {...register("password", { onChange: () => clearError() })}
            />
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {showPassword ? (
                  <motion.div key="off" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                    <EyeOff className="size-4" />
                  </motion.div>
                ) : (
                  <motion.div key="on" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                    <Eye className="size-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </FormField>

        <motion.div variants={stagger.item} className="flex items-center justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Forgot password?
          </Link>
        </motion.div>

        <motion.div variants={stagger.item}>
          <motion.button
            type="submit"
            disabled={isLoading}
            className="group relative flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </motion.div>
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div variants={stagger.item} className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </motion.div>

      {/* SSO */}
      <motion.div variants={stagger.item}>
        <GoogleLoginButton disabled={isLoading} />
      </motion.div>

      {/* Register */}
      <motion.p
        variants={stagger.item}
        className="text-center text-[13px] text-muted-foreground"
      >
        Don&apos;t have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="font-medium text-foreground transition-colors hover:underline"
        >
          Start free trial
        </Link>
      </motion.p>
    </motion.div>
  )
}
