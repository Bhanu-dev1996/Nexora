import { motion } from "framer-motion"
import { useMemo } from "react"
import {
  Users,
  Contact,
  Building2,
  Handshake,
  TrendingUp,
  DollarSign,
  Clock,
  Trophy,
  ArrowUpRight,
  CalendarDays,
  Bell,
  Zap,
  Activity,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { ROUTES } from "@/lib/constants"
import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ScrollArea, ScrollAreaViewport } from "@/components/ui/scroll-area"
import {
  PieChart,
  Pie,
  Cell,
  // Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

const fmt = (n: number) => n.toLocaleString()
const currency = (n: number) => `$${n.toLocaleString()}`
const pct = (n: number) => `${n.toFixed(1)}%`

const CHART_COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]
const PIPELINE_COLOR = "hsl(var(--chart-1))"

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "info"

const leadStatusVariant: Record<string, BadgeVariant> = {
  new: "info",
  warm: "warning",
  cold: "secondary",
  lost: "danger",
  converted: "success",
}

const dealStageVariant: Record<string, BadgeVariant> = {
  prospect: "info",
  negotiation: "warning",
  closing: "success",
  won: "success",
  lost: "danger",
}

const taskPriorityVariant: Record<string, BadgeVariant> = {
  high: "danger",
  medium: "warning",
  low: "secondary",
}

const taskStatusVariant: Record<string, BadgeVariant> = {
  pending: "warning",
  in_progress: "info",
  completed: "success",
}

function StatCardSkeleton() {
  return <div className="h-[88px] animate-pulse rounded-xl bg-muted/50" />
}

function RecentItemList({
  items,
  renderItem,
  emptyText,
  viewAllLink,
  loading,
  showFooter = true,
}: {
  items: unknown[]
  renderItem: (item: unknown, index: number) => React.ReactNode
  emptyText: string
  viewAllLink: string
  loading: boolean
  showFooter?: boolean
}) {
  if (loading) {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-12 animate-pulse bg-muted/30" />
    ))
  }

  if (items.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </p>
    )
  }

  return (
    <>
      {items.map((item, i) => renderItem(item, i))}
      {showFooter ? (
        <div className="border-t px-5 py-2.5">
          <Link
            to={viewAllLink}
            className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View all <ArrowUpRight className="size-3" />
          </Link>
        </div>
      ) : null}
    </>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading, error, refetch } = useDashboardStats()
  const overview = stats?.overview
  const totalDeals = (overview?.openDeals ?? 0) + (overview?.wonDeals ?? 0)
  const conversionRate = totalDeals > 0 ? ((overview?.wonDeals ?? 0) / totalDeals) * 100 : 0
  const monthlyRevenue = overview?.totalRevenue ? overview.totalRevenue / 12 : 0
  const yearlyRevenue = overview?.totalRevenue ?? 0
  const salesGrowth = overview?.totalRevenue ? Math.max(0, Math.min(42, ((overview.totalRevenue - overview.totalPipelineValue) / Math.max(overview.totalRevenue, 1)) * 100)) : 0
  const teamPerformance = overview?.totalTasks ? Math.round(((overview.totalTasks - overview.pendingTasks) / overview.totalTasks) * 100) : 0
  const meetingsCount = 4

  const recentActivities = useMemo(() => {
    if (!stats) return []

    const leadEvents = stats.recentLeads.map((item) => ({
      id: `lead-${item.id}`,
      title: `${item.firstName} ${item.lastName}`,
      subtitle: `Lead ${item.status}`,
      date: item.createdAt,
      type: "Lead",
    }))
    const dealEvents = stats.recentDeals.map((item) => ({
      id: `deal-${item.id}`,
      title: item.title,
      subtitle: `Deal ${item.stage}`,
      date: item.createdAt,
      type: "Deal",
    }))
    const contactEvents = stats.recentContacts.map((item) => ({
      id: `contact-${item.id}`,
      title: `${item.firstName} ${item.lastName}`,
      subtitle: "New contact",
      date: item.createdAt,
      type: "Contact",
    }))
    const taskEvents = stats.recentTasks.map((item) => ({
      id: `task-${item.id}`,
      title: item.title,
      subtitle: `Task ${item.status}`,
      date: item.createdAt,
      type: "Task",
    }))

    return [...leadEvents, ...dealEvents, ...contactEvents, ...taskEvents]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [stats])

  const revenueGraphData = useMemo(
    () => [
      { month: "Jan", revenue: Math.round(monthlyRevenue * 0.9) },
      { month: "Feb", revenue: Math.round(monthlyRevenue * 1.1) },
      { month: "Mar", revenue: Math.round(monthlyRevenue * 0.95) },
      { month: "Apr", revenue: Math.round(monthlyRevenue * 1.2) },
      { month: "May", revenue: Math.round(monthlyRevenue * 1.05) },
      { month: "Jun", revenue: Math.round(monthlyRevenue * 1.15) },
    ],
    [monthlyRevenue]
  )

  const funnelStages = useMemo(
    () =>
      stats?.leadsByStatus.map((item) => ({
        stage: item.status,
        value: item.count,
      })) ?? [],
    [stats]
  )

  const upcomingMeetings = [
    { id: "m1", title: "Client Sync", time: "Today · 3:00 PM" },
    { id: "m2", title: "Team Standup", time: "Tomorrow · 9:00 AM" },
    { id: "m3", title: "Quarterly Review", time: "Fri · 1:30 PM" },
  ]

  const notifications = [
    { id: "n1", text: "New deal was won by Alice." },
    { id: "n2", text: "5 leads require follow-up." },
    { id: "n3", text: "Pipeline value increased by 8%." },
  ]

  const statCards = [
    { label: "Revenue", value: currency(yearlyRevenue), icon: DollarSign, color: "bg-info/10 text-info" },
    { label: "Customers", value: fmt(overview?.totalContacts ?? 0), icon: Users, color: "bg-chart-2/10 text-chart-2" },
    { label: "Deals", value: fmt(totalDeals), icon: Handshake, color: "bg-chart-4/10 text-chart-4" },
    { label: "Leads", value: fmt(overview?.totalLeads ?? 0), icon: Contact, color: "bg-chart-1/10 text-chart-1" },
    { label: "Tasks", value: fmt(overview?.totalTasks ?? 0), icon: Clock, color: "bg-warning/10 text-warning" },
    { label: "Meetings", value: fmt(meetingsCount), icon: CalendarDays, color: "bg-success/10 text-success" },
    { label: "Conversion Rate", value: pct(conversionRate), icon: TrendingUp, color: "bg-chart-5/10 text-chart-5" },
    { label: "Sales Growth", value: `${salesGrowth.toFixed(1)}%`, icon: ArrowUpRight, color: "bg-success/10 text-success" },
    { label: "Monthly Revenue", value: currency(monthlyRevenue), icon: DollarSign, color: "bg-info/10 text-info" },
    { label: "Yearly Revenue", value: currency(yearlyRevenue), icon: Trophy, color: "bg-success/10 text-success" },
    { label: "Team Performance", value: `${teamPerformance}%`, icon: Activity, color: "bg-primary/10 text-primary" },
    { label: "Pipeline", value: currency(overview?.totalPipelineValue ?? 0), icon: TrendingUp, color: "bg-chart-3/10 text-chart-3" },
    { label: "Open Deals", value: fmt(overview?.openDeals ?? 0), icon: Handshake, color: "bg-chart-4/10 text-chart-4" },
    { label: "Won Deals", value: fmt(overview?.wonDeals ?? 0), icon: Trophy, color: "bg-success/10 text-success" },
    { label: "Pending Tasks", value: fmt(overview?.pendingTasks ?? 0), icon: Clock, color: "bg-warning/10 text-warning" },
  ]

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <p className="text-sm text-muted-foreground">Failed to load dashboard data</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card, i) => (
              <motion.div
                key={card.label}
                className="h-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Card className="h-full p-0 gap-0">
                  <CardContent className="flex items-center gap-4 p-5">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${card.color}`}>
                      <card.icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{card.label}</p>
                      <p className="truncate text-2xl font-bold tracking-tight">{card.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-2 items-stretch">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="h-full p-0 gap-0">
              <CardContent className="space-y-4 p-5">
                <h2 className="text-sm font-semibold tracking-tight">
                  Leads by Status
                </h2>
                {stats?.leadsByStatus && stats.leadsByStatus.length > 0 ? (
                  <div className="flex justify-center items-center gap-4">
                    <div className="shrink-0">
                      <ResponsiveContainer width={140} height={180}>
                        <PieChart>
                          <Pie
                            data={stats.leadsByStatus}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={60}
                            paddingAngle={2}
                            strokeWidth={0}
                          >
                            {stats.leadsByStatus.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          {/* <Tooltip
                            contentStyle={{
                              background: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "var(--radius-md)",
                              fontSize: 13,
                            }}
                            formatter={(
                              value: number | string | undefined,
                              name: string | undefined
                            ) => [value ?? 0, name ?? ""]}
                          /> */}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-1.5">
                      {stats.leadsByStatus.map((d, i) => (
                        <div key={d.status} className="flex items-center gap-2 text-xs">
                          <span
                            className="size-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                          />
                          <span className="w-14 capitalize text-muted-foreground">{d.status}</span>
                          <span className="font-medium">{d.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No leads yet</p>
                )}
                </CardContent>
              <CardFooter className="gap-4">
                <span className="text-xs text-muted-foreground">
                  New: <strong className="text-foreground">{overview?.newLeads ?? 0}</strong>
                </span>
                <span className="text-xs text-muted-foreground">
                  Conversion: <strong className="text-foreground">{pct(conversionRate)}</strong>
                </span>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="h-full p-0 gap-0">
              <CardContent className="space-y-4 p-5">
                <h2 className="text-sm font-semibold tracking-tight">
                  Pipeline Graph
                </h2>
                {stats?.dealsByStage && stats.dealsByStage.length > 0 ? (
                  <div className="h-[180px] bg-transparent">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.dealsByStage}
                        layout="vertical"
                        margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
                        style={{ background: "transparent" }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis
                          type="category"
                          dataKey="stage"
                          tick={{ fontSize: 11, textAnchor: "end", dx: -8 }}
                          axisLine={false}
                          tickLine={false}
                          width={100}
                          interval={0}
                        />
                        {/* <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius-md)",
                            fontSize: 13,
                          }}
                          formatter={(value: number | string | undefined) => [
                            currency(typeof value === "number" ? value : 0),
                            "Amount",
                          ]}
                        /> */}
                        <Bar
                          dataKey="totalAmount"
                          radius={[0, 4, 4, 0]}
                          fill={PIPELINE_COLOR}
                          isAnimationActive={false}
                          stroke="none"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">No deals yet</p>
                )}
              </CardContent>
              <CardFooter className="gap-4">
                <span className="text-xs text-muted-foreground">
                  Avg Deal:{" "}
                  <strong className="text-foreground">{currency(overview?.averageDealValue ?? 0)}</strong>
                </span>
                <span className="text-xs text-muted-foreground">
                  Pipeline:{" "}
                  <strong className="text-foreground">{currency(overview?.totalPipelineValue ?? 0)}</strong>
                </span>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Revenue Graph</h2>
                <Badge variant="secondary">Monthly</Badge>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueGraphData} margin={{ top: 12, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Sales Funnel</h2>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="space-y-4">
                {funnelStages.length > 0 ? (
                  funnelStages.map((stage) => (
                    <div key={stage.stage} className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">{stage.stage}</span>
                        <span>{stage.value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-chart-3"
                          style={{ width: `${Math.min(100, stage.value * 10)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No funnel data available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">AI Insights</h2>
                <Zap className="size-4 text-primary" />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Revenue is trending {salesGrowth >= 0 ? "up" : "down"} by {Math.abs(salesGrowth).toFixed(1)}%.</p>
                <p>Top lead status: {stats?.leadsByStatus?.[0]?.status ?? "N/A"}.</p>
                <p>{overview?.pendingTasks ?? 0} tasks are still open — focus on next-step follow-up.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Quick Actions</h2>
                <Zap className="size-4 text-primary" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to={ROUTES.LEADS}>New Lead</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={ROUTES.CONTACTS}>New Contact</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={ROUTES.DEALS}>New Deal</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to={ROUTES.TASKS}>New Task</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Tasks Widget</h2>
                <Badge variant="secondary">Status</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold">{overview?.pendingTasks ?? 0}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold">{Math.max(0, (overview?.totalTasks ?? 0) - (overview?.pendingTasks ?? 0))}</p>
                </div>
                <div className="rounded-xl bg-muted p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{overview?.totalTasks ?? 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Notifications</h2>
                <Bell className="size-4 text-primary" />
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-xl bg-muted p-3">
                    {notification.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Recent Activities</h2>
                <Badge variant="secondary">Live</Badge>
              </div>
              <div className="space-y-3 overflow-hidden">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between gap-3 rounded-xl bg-muted p-3">
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activity available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Upcoming Meetings</h2>
                <CalendarDays className="size-4 text-primary" />
              </div>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="rounded-xl bg-muted p-3">
                    <p className="text-sm font-medium">{meeting.title}</p>
                    <p className="text-xs text-muted-foreground">{meeting.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-4 p-5 flex-1">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Calendar Widget</h2>
                <CalendarDays className="size-4 text-primary" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="font-semibold">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][index]}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-2 text-xs ${index === new Date().getDate() - 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Recent Leads
                </h2>
                <Link
                  to={ROUTES.LEADS}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-primary hover:text-foreground"
                >
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="divide-y flex-1 min-h-0">
              <ScrollArea className="h-full">
                <ScrollAreaViewport className="pb-2">
                  <RecentItemList
                    items={stats?.recentLeads ?? []}
                    loading={isLoading}
                    emptyText="No leads yet"
                    viewAllLink={ROUTES.LEADS}
                    showFooter={false}
                    renderItem={(item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">Score: {item.score}</p>
                        </div>
                        <Badge variant={leadStatusVariant[item.status] ?? "secondary"}>
                          {item.status}
                        </Badge>
                      </div>
                    )}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
            </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Recent Deals
                </h2>
                <Link
                  to={ROUTES.DEALS}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-primary hover:text-foreground"
                >
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="divide-y flex-1 min-h-0">
              <ScrollArea className="h-full">
                <ScrollAreaViewport className="pb-2">
                  <RecentItemList
                    items={stats?.recentDeals ?? []}
                    loading={isLoading}
                    emptyText="No deals yet"
                    viewAllLink={ROUTES.DEALS}
                    showFooter={false}
                    renderItem={(item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">{item.title}</p>
                          <Badge variant={dealStageVariant[item.stage] ?? "secondary"}>
                            {item.stage}
                          </Badge>
                        </div>
                        <p className="text-[13px] font-semibold">
                          {item.amount != null ? currency(item.amount) : "\u2014"}
                        </p>
                      </div>
                    )}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
            </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Recent Contacts
                </h2>
                <Link
                  to={ROUTES.CONTACTS}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-primary hover:text-foreground"
                >
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="divide-y flex-1 min-h-0">
              <ScrollArea className="h-full">
                <ScrollAreaViewport className="pb-2">
                  <RecentItemList
                    items={stats?.recentContacts ?? []}
                    loading={isLoading}
                    emptyText="No contacts yet"
                    viewAllLink={ROUTES.CONTACTS}
                    showFooter={false}
                    renderItem={(item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium">
                            {item.firstName} {item.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{item.email}</p>
                        </div>
                      </div>
                    )}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
            </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="h-full p-0 gap-0 flex flex-col min-h-0">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-sm font-semibold tracking-tight">
                  Recent Tasks
                </h2>
                <Link
                  to={ROUTES.TASKS}
                  className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-primary hover:text-foreground"
                >
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <div className="divide-y flex-1 min-h-0">
              <ScrollArea className="h-full">
                <ScrollAreaViewport className="pb-2">
                  <RecentItemList
                    items={stats?.recentTasks ?? []}
                    loading={isLoading}
                    emptyText="No tasks yet"
                    viewAllLink={ROUTES.TASKS}
                    showFooter={false}
                    renderItem={(item: any) => (
                      <div key={item.id} className="flex items-center justify-between py-3">
                        <div className="min-w-0">
                          <p className="truncate max-w-[160px] text-[13px] font-medium">{item.title}</p>
                          <Badge variant={taskStatusVariant[item.status] ?? "secondary"}>
                            {item.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <Badge variant={taskPriorityVariant[item.priority] ?? "secondary"}>
                          {item.priority}
                        </Badge>
                      </div>
                    )}
                  />
                </ScrollAreaViewport>
              </ScrollArea>
            </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
