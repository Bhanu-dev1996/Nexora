import { LogOut, ChevronDown, Search } from "lucide-react"
import { motion } from "framer-motion"
import { useAuthStore } from "@/stores/auth-store"
import { useState, useRef, useEffect } from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Topbar() {
  const { user, logout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase()

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm supports-backdrop-blur:bg-background/60 relative z-10">
      <SidebarTrigger />

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          className="h-8 w-full rounded-lg border bg-surface pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-ring focus:ring-1 focus:ring-ring"
        />
      </div>

      <div className="flex-1" />

      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted"
        >
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-xs font-medium text-white shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="size-8 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden text-left text-[13px] md:block">
            <p className="font-medium leading-tight text-foreground">{user?.firstName} {user?.lastName}</p>
            <p className="leading-tight text-muted-foreground">{user?.email}</p>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border bg-card shadow-lg"
          >
            <button
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </div>
    </header>
  )
}
