import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and organization.</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-20">
        <Settings className="mb-3 size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Settings module coming soon</p>
      </div>
    </div>
  )
}
