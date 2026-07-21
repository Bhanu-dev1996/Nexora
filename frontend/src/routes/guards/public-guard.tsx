import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/auth-store"
import { ROUTES } from "@/lib/constants"

export function PublicGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}
