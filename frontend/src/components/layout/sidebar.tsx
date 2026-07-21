import { Link, useLocation } from "react-router"
import {
  LayoutDashboard,
  Users,
  Contact,
  Building2,
  Handshake,
  CheckSquare,
  Settings,
} from "lucide-react"
import { ROUTES } from "@/lib/constants"
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Leads", href: ROUTES.LEADS, icon: Users },
  { label: "Contacts", href: ROUTES.CONTACTS, icon: Contact },
  { label: "Companies", href: ROUTES.COMPANIES, icon: Building2 },
  { label: "Deals", href: ROUTES.DEALS, icon: Handshake },
  { label: "Tasks", href: ROUTES.TASKS, icon: CheckSquare },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <ShadcnSidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-start gap-3 px-3 py-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 text-white text-base font-bold shadow-sm group-data-[collapsible=icon]:size-8">
            N
          </div>
          <span className="truncate text-base font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Nexora
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col">
              {NAV_ITEMS.map((item) => {
                const active = location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link to={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  )
}
