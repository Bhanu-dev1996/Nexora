import { motion } from "framer-motion"
import { Plus, CheckSquare } from "lucide-react"

export default function TasksPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">Stay on top of your to-dos.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Task
        </motion.button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20">
        <CheckSquare className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Tasks module coming soon</p>
      </div>
    </div>
  )
}
