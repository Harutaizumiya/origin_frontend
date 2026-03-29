import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: "critical" | "warning" | "normal";
  children: React.ReactNode;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
}) => (
  <span
    className={cn(
      "w-2 h-2 rounded-full",
      status === "critical"
        ? "bg-error"
        : status === "warning"
          ? "bg-amber-500"
          : "bg-primary",
    )}
  >
    {children}
  </span>
);
