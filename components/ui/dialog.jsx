import { clsx } from "clsx"

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg rounded-lg">
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className, ...props }) => (
  <div className={clsx("grid gap-4", className)} {...props}>
    {children}
  </div>
)

const DialogHeader = ({ children, className, ...props }) => (
  <div className={clsx("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
    {children}
  </div>
)

const DialogTitle = ({ children, className, ...props }) => (
  <h3 className={clsx("text-lg font-semibold leading-none tracking-tight", className)} {...props}>
    {children}
  </h3>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle }