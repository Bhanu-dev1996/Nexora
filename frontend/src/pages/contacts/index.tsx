import { motion } from "framer-motion"
import { Plus, Contact } from "lucide-react"

export default function ContactsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">All your contacts in one place.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="size-4" />
          Add Contact
        </motion.button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20">
        <Contact className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Contacts module coming soon</p>
      </div>
    </div>
  )
}
