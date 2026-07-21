import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, ArrowRight, Mail } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnimatedCard, stagger } from "@/components/auth/animations"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import { useAuthStore } from "@/stores/auth-store"
import { registerSchema, type RegisterFormData } from "@/lib/validators"
import { ROUTES } from "@/lib/constants"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      organizationName: "",
      password: "",
      confirmPassword: "",
    },
  })

  const passwordValue = watch("password")

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data)
      setIsSuccess(true)
    } catch {
      // handled by store
    }
  }

  if (isSuccess) {
    return (
      <AnimatedCard>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/10"
          >
            <Mail className="size-8 text-success" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We&apos;ve sent a verification link to your email. Please verify your account before signing in.
            </p>
          </div>
          <Link
            to={ROUTES.LOGIN}
            className="flex h-9 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Go to sign in
          </Link>
        </motion.div>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard>
      <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={stagger.item} className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Start your 14-day free trial — no credit card required
          </p>
        </motion.div>

        {/* Error */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="John"
                autoComplete="given-name"
                disabled={isLoading}
                className="h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                {...register("firstName", { onChange: () => clearError() })}
              />
              <AnimatePresence>
                {errors.firstName && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                    {errors.firstName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                disabled={isLoading}
                className="h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                {...register("lastName", { onChange: () => clearError() })}
              />
              <AnimatePresence>
                {errors.lastName && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                    {errors.lastName.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              {...register("email", { onChange: () => clearError() })}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="organizationName">Company name</Label>
            <Input
              id="organizationName"
              placeholder="Acme Inc."
              autoComplete="organization"
              disabled={isLoading}
              className="h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              {...register("organizationName", { onChange: () => clearError() })}
            />
            <AnimatePresence>
              {errors.organizationName && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                  {errors.organizationName.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                disabled={isLoading}
                className="h-9 pr-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
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
            <AnimatePresence>
              {errors.password && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <PasswordStrength password={passwordValue || ""} />

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={isLoading}
                className="h-9 pr-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                {...register("confirmPassword", { onChange: () => clearError() })}
              />
              <motion.button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {showConfirm ? (
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
            <AnimatePresence>
              {errors.confirmPassword && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="relative flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Creating account...
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="size-4" />
                </motion.div>
              )}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                className="absolute inset-0 rounded-lg bg-white/10"
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </motion.button>
        </form>

        <motion.p
          variants={stagger.item}
          className="text-center text-sm text-muted-foreground"
        >
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-medium text-foreground transition-colors hover:underline"
          >
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </AnimatedCard>
  )
}
