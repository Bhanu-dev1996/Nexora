import { motion } from "framer-motion"
import {
  TrendingUp,
  Users,
  UserPlus,
  Handshake,
  CheckCircle2,
  Building2,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useAuthStore } from "@/stores/auth-store"
import { useDashboardStats } from "@/hooks/use-dashboard-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const fmt = (n: number) => n.toLocaleString()
const currency = (n: number) => `\u20B9${n.toLocaleString()}`
const pct = (n: number) => `${n.toFixed(1)}%`

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

function Sparkline({ data, color }: { data: { value: number }[]; color: string }) {
  if (data.length < 2) return null
  const values = data.map((d) => d.value)
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const w = 80
  const h = 28
  const stepX = w / (values.length - 1)
  const points = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / range) * h).toFixed(1)}`).join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  )
}

// Recharts Line Chart Component
function RevenueChart({ data }: { data: number[] }) {
  if (data.length === 0) return null
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const chartData = data.map((amount, i) => ({
    name: months[i] || `Day ${i + 1}`,
    value: amount,
  }))
  
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis 
          dataKey="name" 
          stroke="currentColor" 
          opacity={0.6}
          style={{ fontSize: "12px" }}
        />
        <YAxis 
          stroke="currentColor" 
          opacity={0.6}
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip 
          formatter={(value: any) => currency(value)}
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="rgb(59, 130, 246)" 
          strokeWidth={3}
          dot={{ fill: "rgb(59, 130, 246)", r: 4 }}
          activeDot={{ r: 6 }}
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function SalesFunnelChart({ data: stages }: { data: { stage: string; count: number; totalAmount: number }[] }) {
  if (!stages || stages.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">No funnel data</p>

  const colors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]
  const maxValue = stages[0].count
  const w = 260
  const h = 180
  const segH = h / stages.length

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[260px]">
        {stages.map((s, i) => {
          const pct = s.count / maxValue
          const cw = w * pct
          const x = (w - cw) / 2
          const y = i * segH
          return (
            <g key={s.stage}>
              <rect x={x} y={y} width={cw} height={segH - 2} fill={colors[i % colors.length]} opacity={0.85} rx={3} />
              <text x={w / 2} y={y + segH / 2 + 4} textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">
                {s.count}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {stages.map((s, i) => (
          <div key={s.stage} className="flex items-center gap-1.5 text-xs">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="capitalize text-muted-foreground">{s.stage}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Deal Pipeline Stacked Bar Chart Component
function DealPipelineChart() {
  const pipelineData = [
    {
      stage: "Q1",
      "Early Stage": 45000,
      "In Progress": 75000,
      "Advanced": 120000,
    },
    {
      stage: "Q2",
      "Early Stage": 38000,
      "In Progress": 92000,
      "Advanced": 145000,
    },
    {
      stage: "Q3",
      "Early Stage": 52000,
      "In Progress": 68000,
      "Advanced": 165000,
    },
    {
      stage: "Q4",
      "Early Stage": 61000,
      "In Progress": 85000,
      "Advanced": 180000,
    },
  ]

  const colors = ["rgb(59, 130, 246)", "rgb(168, 85, 247)", "rgb(34, 197, 94)"]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={pipelineData}
        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis
          dataKey="stage"
          stroke="currentColor"
          opacity={0.6}
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="currentColor"
          opacity={0.6}
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          formatter={(value: any) => currency(value)}
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "8px",
            color: "#fff",
          }}
        />
        <Bar dataKey="Early Stage" stackId="pipeline" fill={colors[0]} radius={[8, 8, 0, 0]} isAnimationActive={true} />
        <Bar dataKey="In Progress" stackId="pipeline" fill={colors[1]} isAnimationActive={true} />
        <Bar dataKey="Advanced" stackId="pipeline" fill={colors[2]} isAnimationActive={true} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function KpiCard({
  icon: Icon,
  iconColor,
  title,
  value,
  change,
  changeLabel,
  sparklineData,
  details: Details,
}: {
  icon: React.ElementType
  iconColor: string
  title: string
  value: string
  change?: { value: string; positive: boolean }
  changeLabel?: string
  sparklineData?: { value: number }[]
  details?: React.ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full"
    >
      <Card 
        className="group relative h-full overflow-hidden gap-0 p-0 transition-all duration-300 hover:shadow-lg hover:border-primary/50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label={`${title} metric card`}
      >
        {/* Gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <CardContent className="relative flex h-full flex-col justify-between gap-3 p-4">
          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${iconColor} shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="size-4" strokeWidth={1.8} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {title}
                </p>
                <h3 className="mt-1 text-2xl font-bold tracking-tight text-foreground truncate">
                  {value}
                </h3>
              </div>
              {isHovered && change && (
                <motion.div
                  initial={{ opacity: 0, x: 4 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-semibold shrink-0"
                >
                  {change.positive ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="size-3" />
                      {change.value}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <ArrowDownRight className="size-3" />
                      {change.value}
                    </span>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0.5 }}
              className="transition-opacity duration-300"
              aria-hidden="true"
            >
              <Sparkline data={sparklineData} color="currentColor" />
            </motion.div>
          )}

          {/* Footer Section with Change and Details */}
          <div className="space-y-1.5 border-t border-border/50 pt-2">
            {change && !isHovered && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {changeLabel}
                </span>
                <span className={`text-xs font-semibold ${change.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {change.value}
                </span>
              </div>
            )}

            {/* Detailed Information */}
            {/* {Details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ 
                  opacity: isHovered ? 1 : 0.7,
                  height: "auto",
                }}
                className="text-xs text-muted-foreground/80 transition-opacity duration-300"
              >
                {Details}
              </motion.div>
            )} */}

            {/* {!Details && change && isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-muted-foreground/70"
              >
                vs last month
              </motion.div>
            )} */}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function Skeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="h-40 rounded-xl bg-muted/50"
      aria-hidden="true"
    />
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data: stats, isLoading, error, refetch } = useDashboardStats()
  const overview = stats?.overview
  const totalDeals = (overview?.openDeals ?? 0) + (overview?.wonDeals ?? 0)
  const conversionRate = totalDeals > 0 ? ((overview?.wonDeals ?? 0) / totalDeals) * 100 : 0
  const completedTasks = (overview?.totalTasks ?? 0) - (overview?.pendingTasks ?? 0) - (overview?.tasksOverdue ?? 0)
  const completionRate = (overview?.totalTasks ?? 0) > 0 ? (completedTasks / (overview?.totalTasks ?? 0)) * 100 : 0

  const sparklineOpts = (data: { count?: number; amount?: number }[] | undefined, key: "count" | "amount") =>
    (data ?? []).map((d) => ({ value: Number(d[key] ?? 0) }))

  const kpiCards = [
    {
      icon: TrendingUp,
      iconColor: "bg-emerald-500/10 text-emerald-500",
      title: "Total Revenue",
      value: currency(overview?.totalRevenue ?? 0),
      change: { value: pct(overview?.revenueGrowth ?? 0), positive: (overview?.revenueGrowth ?? 0) >= 0 },
      changeLabel: "vs last month",
      sparklineData: sparklineOpts(stats?.dailyRevenue, "amount"),
      details: (
        <span>This month: <strong>{currency(overview?.revenueThisMonth ?? 0)}</strong></span>
      ),
    },
    {
      icon: Users,
      iconColor: "bg-blue-500/10 text-blue-500",
      title: "Customers",
      value: fmt(overview?.totalContacts ?? 0),
      change: { value: `+${overview?.newContactsThisMonth ?? 0}`, positive: true },
      changeLabel: "new this month",
    },
    {
      icon: UserPlus,
      iconColor: "bg-purple-500/10 text-purple-500",
      title: "Leads",
      value: fmt(overview?.totalLeads ?? 0),
      change: { value: `+${overview?.leadsToday ?? 0}`, positive: true },
      changeLabel: "today",
      sparklineData: sparklineOpts(stats?.dailyLeads, "count"),
      details: (
        <span>Open: <strong>{fmt(overview?.openLeadsCount ?? 0)}</strong></span>
      ),
    },
    {
      icon: Handshake,
      iconColor: "bg-amber-500/10 text-amber-500",
      title: "Deals",
      value: fmt(overview?.openDeals ?? 0),
      change: { value: currency(overview?.totalPipelineValue ?? 0), positive: true },
      changeLabel: "pipeline",
      details: (
        <span>Won: <strong className="text-emerald-500">{fmt(overview?.wonDeals ?? 0)}</strong></span>
      ),
    },
    {
      icon: CheckCircle2,
      iconColor: "bg-rose-500/10 text-rose-500",
      title: "Tasks",
      value: fmt(overview?.pendingTasks ?? 0),
      change: { value: `${overview?.tasksDueToday ?? 0}`, positive: false },
      changeLabel: "due today",
      details: (
        <div className="flex gap-3">
          <span>Due today: <strong>{fmt(overview?.tasksDueToday ?? 0)}</strong></span>
          <span>Overdue: <strong className="text-red-500">{fmt(overview?.tasksOverdue ?? 0)}</strong></span>
        </div>
      ),
    },
    {
      icon: Building2,
      iconColor: "bg-cyan-500/10 text-cyan-500",
      title: "Companies",
      value: fmt(overview?.totalCompanies ?? 0),
    },
    {
      icon: Target,
      iconColor: "bg-violet-500/10 text-violet-500",
      title: "Conversion Rate",
      value: pct(conversionRate),
      change: { value: `${fmt(totalDeals)} total`, positive: true },
      changeLabel: "deals closed",
    },
    {
      icon: BarChart3,
      iconColor: "bg-orange-500/10 text-orange-500",
      title: "Task Completion",
      value: pct(completionRate),
      change: { value: `${fmt(completedTasks)}/${fmt(overview?.totalTasks ?? 0)}`, positive: true },
      changeLabel: "completed",
      details: (
        <span>Pending: <strong className="text-amber-500">{fmt(overview?.pendingTasks ?? 0)}</strong></span>
      ),
    },
  ]

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-6 py-32 px-4"
      >
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-foreground">Unable to load dashboard</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            We encountered an issue while fetching your dashboard data. Please try again.
          </p>
        </div>
        <Button 
          onClick={() => refetch()}
          className="gap-2"
          aria-label="Retry loading dashboard"
        >
          <span>Retry</span>
          <ChevronRight className="size-4" />
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -8 }} 
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1.5"
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome back, {user?.firstName || "User"}
            </h1>
            <p className="text-sm font-medium text-muted-foreground">{today}</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="space-y-3">
        {/* <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Key Metrics</h2>
          {!isLoading && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => refetch()}
              aria-label="Refresh dashboard"
              className="text-xs"
            >
              Refresh
            </Button>
          )}
        </div> */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
            : kpiCards.map((card) => (
              <KpiCard key={card.title} {...card} />
            ))}
        </div>
      </div>

      {/* Analytics Cards - 3 Columns */}
      <div className="space-y-3">
        {/* <h2 className="text-lg font-semibold text-foreground">Analytics</h2> */}
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => {
            // Generate dummy revenue data
            const revenueData = [42000, 48000, 45000, 52000, 58000, 62000, 68000]
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group relative h-80 overflow-hidden p-0 gap-0 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <CardContent className="relative flex h-full flex-col justify-between p-5">
                    {i === 0 ? (
                      <div className="flex flex-col h-full space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground/70">Revenue Trend</p>
                          {/* <p className="text-lg font-bold text-foreground">{currency(Math.max(...revenueData))}</p> */}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <RevenueChart data={revenueData} />
                        </div>
                      </div>
                    ) : i === 1 ? (
                      <div className="flex flex-col h-full space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground/70">Sales Funnel</p>
                          {/* <p className="text-lg font-bold text-foreground">5 Stages</p> */}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <SalesFunnelChart data={stats?.dealsByStage ?? []} />
                        </div>
                      </div>
                    ) : i === 2 ? (
                      <div className="flex flex-col h-full space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase text-muted-foreground/70">Deal Pipeline</p>
                          {/* <p className="text-lg font-bold text-foreground">Quarterly Overview</p> */}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <DealPipelineChart />
                        </div>
                      </div>
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center h-full">
                        <p className="text-sm text-muted-foreground">Card {i + 1}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
