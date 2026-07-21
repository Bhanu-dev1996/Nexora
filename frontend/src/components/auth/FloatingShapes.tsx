import { motion } from "framer-motion"

const shapes = [
  { size: 80, x: "10%", y: "20%", delay: 0, duration: 20, color: "bg-white/10" },
  { size: 120, x: "75%", y: "15%", delay: 2, duration: 25, color: "bg-white/5" },
  { size: 60, x: "85%", y: "65%", delay: 4, duration: 18, color: "bg-white/8" },
  { size: 100, x: "20%", y: "75%", delay: 1, duration: 22, color: "bg-white/6" },
  { size: 40, x: "50%", y: "40%", delay: 3, duration: 15, color: "bg-white/10" },
  { size: 90, x: "60%", y: "80%", delay: 5, duration: 28, color: "bg-white/5" },
  { size: 50, x: "35%", y: "10%", delay: 2.5, duration: 17, color: "bg-white/8" },
  { size: 70, x: "90%", y: "35%", delay: 1.5, duration: 23, color: "bg-white/6" },
]

export function FloatingShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {shapes.map((shape, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-xl ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            scale: [1, 1.1, 0.95, 1.05, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            delay: shape.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
