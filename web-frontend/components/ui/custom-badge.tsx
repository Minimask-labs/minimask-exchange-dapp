import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "purple";
  size?: "sm" | "md";
}

const Badge = ({
  className,
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) => {
  const variantClasses = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/20 text-success border border-success/30",
    warning: "bg-warning/20 text-warning border border-warning/30",
    destructive: "bg-destructive/20 text-destructive border border-destructive/30",
    outline: "border border-border text-foreground",
    purple: "bg-primary/20 text-primary border border-primary/30",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
