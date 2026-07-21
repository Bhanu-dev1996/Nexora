import { useState } from "react"
import { Link } from "react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Loader2, Mail, ArrowRight } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnimatedCard, stagger } from "@/components/auth/animations"
import { apiClient } from "@/lib/api-client"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators"
import { ROUTES } from "@/lib/constants"

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await apiClient.post("/api/v1/auth/forgot-password", data)
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
              <Mail className="size-8 text-success" />
            </motion.div>

            <div className="space-y-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a password reset link to your email address. It may take a moment
                to arrive.
              </p>
            </div>

            <div className="space-y-3">
              <motion.button
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-all hover:bg-muted active:scale-[0.98]"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsSuccess(false)}
              >
                <ArrowLeft className="size-4" />
                Back to sign in
              </motion.button>

              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email?{" "}
                <button
                  onClick={() => setIsSuccess(false)}
                  className="font-medium text-foreground hover:underline"
                >
                  Try again
                </button>
              </p>
            </div>
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
              <motion.div variants={stagger.item} className="space-y-1 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
                <p className="text-sm text-muted-foreground">
                  No worries — we&apos;ll send you a reset link
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
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    disabled={isLoading}
                    className="h-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    {...register("email")}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-xs text-destructive">
                        {errors.email.message}
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
                          Sending...
                        </motion.div>
                      ) : (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                          Send reset link
                          <ArrowRight className="size-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </form>

              <motion.div variants={stagger.item} className="text-center">
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Back to sign in
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  )
}
