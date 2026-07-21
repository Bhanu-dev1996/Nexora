import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"
import { motion } from "framer-motion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnimatedCard } from "@/components/auth/animations"
import { apiClient } from "@/lib/api-client"
import { ROUTES } from "@/lib/constants"

type VerifyStatus = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<VerifyStatus>("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setError("Invalid verification link")
      return
    }
    const verify = async () => {
      try {
        await apiClient.post("/api/v1/auth/verify-email", { token })
        setStatus("success")
      } catch (err: unknown) {
        setStatus("error")
        setError(
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            "Verification failed. The link may have expired."
        )
      }
    }
    verify()
  }, [token])

  return (
    <AnimatedCard>
      <div className="space-y-6 text-center">
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10"
            >
              <Loader2 className="size-8 text-primary" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Verifying your email...</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we verify your email address.
              </p>
            </div>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
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
              <h1 className="text-2xl font-bold tracking-tight">Email verified!</h1>
              <p className="text-sm text-muted-foreground">
                Your email has been verified. You can now access all features of Nexora.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button className="w-full" render={<Link to={ROUTES.LOGIN} />}>
                Sign in
              </Button>
            </motion.div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10"
            >
              <XCircle className="size-8 text-destructive" />
            </motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Verification failed</h1>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-3">
              <Button variant="outline" className="w-full" render={<Link to={ROUTES.LOGIN} />}>
                Back to sign in
              </Button>
              <Link
                to={ROUTES.REGISTER}
                className="text-sm font-medium text-foreground hover:underline"
              >
                Create a new account
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatedCard>
  )
}
