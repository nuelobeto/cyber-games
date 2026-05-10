import { cn } from "@/lib/utils"

export const Container = ({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4", className)}>
      {children}
    </div>
  )
}
