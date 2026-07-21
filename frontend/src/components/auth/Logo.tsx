import { motion } from "framer-motion"

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-8 text-sm", md: "size-10 text-lg", lg: "size-14 text-2xl" }

  return (
    <motion.div
      className={`relative flex items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground ${sizes[size]}`}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      N
      <motion.div
        className="absolute inset-0 rounded-xl bg-primary"
        animate={{ opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  )
}
