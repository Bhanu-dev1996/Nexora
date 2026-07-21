import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function useAuthInit() {
  const initialize = useAuthStore((s) => s.initialize)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => {
    initialize()
  }, [initialize])

  return { isLoading }
}
