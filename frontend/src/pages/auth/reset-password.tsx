import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, CheckCircle, Shield } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnimatedCard, stagger } from "@/components/auth/animations"
import { PasswordStrength } from "@/components/auth/PasswordStrength"
import { apiClient } from "@/lib/api-client"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators"
import { ROUTES } from "@/lib/constants"

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const passwordValue = watch("password")

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError("Invalid or missing reset token")
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post("/api/v1/auth/reset-password", { token, password: data.password })
      setIsSuccess(true)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Something went wrong. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <AnimatedCard>
        <div className="space-y-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10">
            <Shield className="size-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Invalid reset link</h1>
            <p className="text-sm text-muted-foreground">
              This password reset link is invalid or has expired.
            </p>
          </div>
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            Request a new link
          </Link>
        </div>
      </AnimatedCard>
    )
  }

  return (
    <AnimatedCard>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/10"
            >
              <CheckCircle className="size-8 text-success" />
            </motion.div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You can now sign in.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to={ROUTES.LOGIN}
                className="flex h-9 w-full items-center justify-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={stagger.item} className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
                <p className="text-sm text-muted-foreground">
                  Choose a strong password for your account
                </p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <motion.div variants={stagger.item} className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-9 pr-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...register("password")}
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
                </motion.div>

                <PasswordStrength password={passwordValue || ""} />

                <motion.div variants={stagger.item} className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      className="h-9 pr-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      {...register("confirmPassword")}
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
                </motion.div>

                <motion.div variants={stagger.item}>
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          Updating...
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          Update password
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
