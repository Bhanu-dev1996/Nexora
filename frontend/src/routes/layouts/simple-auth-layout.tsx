import { Outlet } from "react-router"
import { motion } from "framer-motion"
import { Logo } from "@/components/auth/Logo"
import { Card, CardContent } from "@/components/ui/card"

export function SimpleAuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <Logo />
          <span className="text-lg font-bold tracking-tight">Nexora</span>
        </div>
        <Card className="p-0 gap-0">
          <CardContent className="p-6">
            <Outlet />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
