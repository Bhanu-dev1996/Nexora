export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_EMAIL: "/verify-email",
  DASHBOARD: "/dashboard",
  LEADS: "/leads",
  CONTACTS: "/contacts",
  COMPANIES: "/companies",
  DEALS: "/deals",
  TASKS: "/tasks",
  SETTINGS: "/settings",
  NOT_FOUND: "*",
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "nexora_access_token",
  REFRESH_TOKEN: "nexora_refresh_token",
  USER: "nexora_user",
} as const

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ORG_ADMIN: "organization_admin",
  MANAGER: "manager",
  SALES_REP: "sales_rep",
  VIEWER: "viewer",
} as const
