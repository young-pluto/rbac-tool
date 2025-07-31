import { clsx } from "clsx"

const Card = ({ className, ...props }) => (
  <div
    className={clsx("rounded-lg border border-gray-200 bg-white text-gray-950 shadow-sm", className)}
    {...props}
  />
)

const CardHeader = ({ className, ...props }) => (
  <div className={clsx("flex flex-col space-y-1.5 p-6", className)} {...props} />
)

const CardTitle = ({ className, ...props }) => (
  <h3 className={clsx("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
)

const CardContent = ({ className, ...props }) => (
  <div className={clsx("p-6 pt-0", className)} {...props} />
)

export { Card, CardHeader, CardTitle, CardContent }