import { motion } from "framer-motion"
import { Plus, Building2 } from "lucide-react"

export default function CompaniesPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-sm text-muted-foreground">Track your business accounts.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Company
        </motion.button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20">
        <Building2 className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Companies module coming soon</p>
      </div>
    </div>
  )
}
