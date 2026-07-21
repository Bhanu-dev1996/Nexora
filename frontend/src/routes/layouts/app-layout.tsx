import { Outlet } from "react-router"
import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function AppLayout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset className="h-screen overflow-hidden">
        <Topbar />
        <div className="min-h-0 flex-1 overflow-y-auto bg-surface-secondary">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
