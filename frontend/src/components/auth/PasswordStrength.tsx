import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
  password: string
}

interface Rule {
  label: string
  test: (p: string) => boolean
}

const rules: Rule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
]

function getStrength(password: string): number {
  return rules.filter((r) => r.test(password)).length
}

const strengthColors = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-warning",
  "bg-success",
]

const strengthLabels = ["Very weak", "Weak", "Fair", "Good", "Strong"]

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null

  const strength = getStrength(password)
  const color = strengthColors[strength]
  const label = strengthLabels[strength]

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <motion.span
          key={label}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-medium"
        >
          {label}
        </motion.span>
      </div>

      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < strength ? color : "bg-muted"
            }`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1">
        {rules.map((rule, i) => {
          const passes = rule.test(password)
          return (
            <motion.div
              key={rule.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-1.5"
            >
              {passes ? (
                <Check className="size-3 text-success" />
              ) : (
                <X className="size-3 text-muted-foreground/50" />
              )}
              <span
                className={`text-[11px] ${
                  passes ? "text-success" : "text-muted-foreground"
                }`}
              >
                {rule.label}
              </span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
