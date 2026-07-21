import { RouterProvider } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { router } from "./routes"
import { useAuthInit } from "./hooks/use-auth-init"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

function AppShell() {
  useAuthInit()
  return <RouterProvider router={router} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
      <Toaster position="top-right" richColors closeButton />
    </QueryClientProvider>
  )
}
