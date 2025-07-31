import { clsx } from "clsx"

const Button = ({ children, className, variant = "default", size = "default", ...props }) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "default",
          "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
          "border border-white/30 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm": variant === "outline",
          "bg-green-600 text-white hover:bg-green-700": variant === "success",
        },
        {
          "h-10 py-2 px-4": size === "default",
          "h-9 px-3": size === "sm",
          "h-11 px-8": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export { Button }