import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/stores/auth-store"
import { ROUTES } from "@/lib/constants"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isInitializing = useAuthStore((s) => s.isInitializing)

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
