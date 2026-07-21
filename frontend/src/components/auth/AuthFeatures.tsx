import { motion } from "framer-motion"

const features = [
  { icon: "🎯", text: "AI-powered lead scoring" },
  { icon: "📊", text: "Real-time pipeline analytics" },
  { icon: "🤝", text: "Team collaboration tools" },
]

export function AuthFeatures() {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.4 } },
      }}
      className="space-y-4"
    >
      <p className="text-sm font-medium text-white/60 uppercase tracking-wider">
        Why Nexora
      </p>
      {features.map((feature) => (
        <motion.div
          key={feature.text}
          variants={{
            hidden: { opacity: 0, x: -20 },
            show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="flex items-center gap-3"
        >
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-lg backdrop-blur-sm">
            {feature.icon}
          </div>
          <span className="text-sm text-white/80">{feature.text}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}
