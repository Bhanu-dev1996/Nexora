import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-xl font-bold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button render={<Link to={ROUTES.DASHBOARD} />}>Go to dashboard</Button>
    </div>
  )
}
