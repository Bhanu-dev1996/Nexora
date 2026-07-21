import { create } from "zustand"
import type { User } from "@/types"
import { apiClient } from "@/lib/api-client"
import { ROUTES, STORAGE_KEYS } from "@/lib/constants"
import type { LoginFormData, RegisterFormData } from "@/lib/validators"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitializing: boolean
  error: string | null

  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  initialize: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,
  error: null,

  login: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiClient.post("/api/v1/auth/login", {
        email: data.email,
        password: data.password,
      })

      const { user, tokens } = response.data.data

      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))

      set({ user, isAuthenticated: true, isLoading: false })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Please try again."
      set({ error: message, isLoading: false })
      throw err
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      await apiClient.post("/api/v1/auth/register", {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        organizationName: data.organizationName,
      })
      set({ isLoading: false })
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Registration failed. Please try again."
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
      await apiClient.post("/api/v1/auth/logout", { refreshToken })
    } catch {
      // Logout even if API call fails
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      set({ user: null, isAuthenticated: false })
      window.location.href = ROUTES.LOGIN
    }
  },

  fetchMe: async () => {
    try {
      const response = await apiClient.get("/api/v1/auth/me")
      const user = response.data.data as User

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      set({ user, isAuthenticated: true, isInitializing: false })
    } catch {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      set({ user: null, isAuthenticated: false, isInitializing: false })
    }
  },

  initialize: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    if (!token) {
      set({ isInitializing: false })
      return
    }

    try {
      const response = await apiClient.get("/api/v1/auth/me")
      const user = response.data.data as User
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
      set({ user, isAuthenticated: true, isInitializing: false })
    } catch {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      set({ user: null, isAuthenticated: false, isInitializing: false })
    }
  },

  clearError: () => set({ error: null }),
}))
