import { createBrowserRouter } from "react-router"
import { AuthLayout } from "./layouts/auth-layout"
import { SimpleAuthLayout } from "./layouts/simple-auth-layout"
import { AppLayout } from "./layouts/app-layout"
import { AuthGuard } from "./guards/auth-guard"
import { PublicGuard } from "./guards/public-guard"
import LoginPage from "@/pages/auth/login"
import RegisterPage from "@/pages/auth/register"
import ForgotPasswordPage from "@/pages/auth/forgot-password"
import ResetPasswordPage from "@/pages/auth/reset-password"
import VerifyEmailPage from "@/pages/auth/verify-email"
import DashboardPage from "@/pages/dashboard"
import LeadsPage from "@/pages/leads"
import ContactsPage from "@/pages/contacts"
import CompaniesPage from "@/pages/companies"
import DealsPage from "@/pages/deals"
import TasksPage from "@/pages/tasks"
import SettingsPage from "@/pages/settings"
import NotFoundPage from "@/pages/not-found"
import { ROUTES } from "@/lib/constants"

export const router = createBrowserRouter([
  {
    element: <PublicGuard />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.REGISTER, element: <RegisterPage /> },
        ],
      },
      {
        element: <SimpleAuthLayout />,
        children: [
          { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
          { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
          { path: ROUTES.VERIFY_EMAIL, element: <VerifyEmailPage /> },
        ],
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.LEADS, element: <LeadsPage /> },
          { path: ROUTES.CONTACTS, element: <ContactsPage /> },
          { path: ROUTES.COMPANIES, element: <CompaniesPage /> },
          { path: ROUTES.DEALS, element: <DealsPage /> },
          { path: ROUTES.TASKS, element: <TasksPage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: ROUTES.NOT_FOUND, element: <NotFoundPage /> },
])
