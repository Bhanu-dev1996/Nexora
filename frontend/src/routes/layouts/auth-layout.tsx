import { Outlet } from "react-router"
import { motion } from "framer-motion"
import { FloatingShapes } from "@/components/auth/FloatingShapes"
import { Logo } from "@/components/auth/Logo"

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — 70% brand */}
      <div className="relative hidden w-[70%] overflow-hidden lg:flex">
        {/* Deep gradient background */}
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, oklch(0.45 0.24 275 / 1) 0%, oklch(0.30 0.18 275 / 1) 50%, oklch(0.18 0.12 275 / 1) 100%)",
          }}
          animate={{
            background: [
              "radial-gradient(ellipse at 20% 50%, oklch(0.45 0.24 275 / 1) 0%, oklch(0.30 0.18 275 / 1) 50%, oklch(0.18 0.12 275 / 1) 100%)",
              "radial-gradient(ellipse at 60% 30%, oklch(0.48 0.22 275 / 1) 0%, oklch(0.32 0.16 275 / 1) 50%, oklch(0.20 0.10 275 / 1) 100%)",
              "radial-gradient(ellipse at 30% 70%, oklch(0.42 0.20 275 / 1) 0%, oklch(0.28 0.14 275 / 1) 50%, oklch(0.16 0.11 275 / 1) 100%)",
              "radial-gradient(ellipse at 20% 50%, oklch(0.45 0.24 275 / 1) 0%, oklch(0.30 0.18 275 / 1) 50%, oklch(0.18 0.12 275 / 1) 100%)",
            ],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <FloatingShapes />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Logo size="lg" />
          </motion.div>

          {/* Center content */}
          <div className="flex flex-1 flex-col justify-center max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <motion.div
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                <span className="text-xs font-medium text-white/80">
                  Trusted by 2,000+ sales teams worldwide
                </span>
              </motion.div>

              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-5xl">
                Close more deals
                <br />
                with{" "}
                <span className="relative">
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                    intelligence
                  </span>
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-white/60 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                  />
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-white/50 xl:text-lg">
                Nexora combines AI-powered analytics with intuitive pipeline management
                to help your team sell smarter and faster.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-12 grid grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              {[
                { value: "40%", label: "More pipeline visibility" },
                { value: "2.5x", label: "Faster deal closures" },
                { value: "99.9%", label: "Uptime guaranteed" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                >
                  <div className="text-2xl font-bold text-white xl:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-xs text-white/40">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottom logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-wider text-white/30">
              Powering sales at
            </p>
            <div className="flex items-center gap-8">
              {["Stripe", "Vercel", "Linear", "Notion"].map((brand, i) => (
                <motion.span
                  key={brand}
                  className="text-sm font-semibold text-white/20 transition-colors hover:text-white/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3 + i * 0.1 }}
                >
                  {brand}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel — 30% form */}
      <div className="flex w-full items-center justify-center px-6 py-10 sm:px-8 lg:w-[30%]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
          className="w-full max-w-[340px]"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <Logo />
            <span className="text-lg font-bold tracking-tight">Nexora</span>
          </div>
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
