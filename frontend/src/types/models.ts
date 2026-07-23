export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  phone?: string
  jobTitle?: string
  role: string
  organizationId: string
  permissions: string[]
  mfaEnabled: boolean
  lastLoginAt?: string
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: string
  refreshTokenExpiresAt?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

export interface DashboardStats {
  overview: {
    totalLeads: number
    newLeads: number
    totalContacts: number
    totalCompanies: number
    openDeals: number
    wonDeals: number
    totalPipelineValue: number
    averageDealValue: number
    totalRevenue: number
    totalTasks: number
    pendingTasks: number
    revenueThisMonth: number
    revenueLastMonth: number
    revenueGrowth: number
    newContactsThisMonth: number
    leadsToday: number
    openLeadsCount: number
    tasksDueToday: number
    tasksOverdue: number
  }
  leadsByStatus: { status: string; count: number }[]
  dealsByStage: { stage: string; count: number; totalAmount: number }[]
  dailyLeads: { date: string; count: number }[]
  dailyRevenue: { date: string; amount: number }[]
  recentLeads: { id: string; firstName: string; lastName: string; status: string; score: number; createdAt: string }[]
  recentDeals: { id: string; title: string; amount: number | null; stage: string; status: string; createdAt: string }[]
  recentContacts: { id: string; firstName: string; lastName: string; email: string; createdAt: string }[]
  recentTasks: { id: string; title: string; status: string; priority: string; createdAt: string }[]
}
