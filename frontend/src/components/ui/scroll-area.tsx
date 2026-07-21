import * as React from "react"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative overflow-hidden", className)} {...props} />
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollAreaViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "h-full w-full overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-muted/60 scrollbar-track-transparent",
        className
      )}
      {...props}
    />
  )
)
ScrollAreaViewport.displayName = "ScrollAreaViewport"

export { ScrollArea, ScrollAreaViewport }
