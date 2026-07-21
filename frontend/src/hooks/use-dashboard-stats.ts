import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { DashboardStats } from "@/types"

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/api/v1/dashboard/stats")
      return data.data
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  })
}
