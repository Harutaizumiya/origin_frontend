import React from "react";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "../../lib/utils";

interface TrendBadgeProps {
  trend?: string;
  trendType?: "up" | "down" | "neutral";
}

export const TrendBadge: React.FC<TrendBadgeProps> = ({ trend, trendType }) => {
  if (!trend) return null;

  return (
    <span
      className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
        trendType === "up"
          ? "text-green-600 bg-green-50"
          : trendType === "down"
            ? "text-error bg-error/10"
            : "text-amber-600 bg-amber-50",
      )}
    >
      {trendType === "up" ? (
        <TrendingUp size={14} />
      ) : trendType === "down" ? (
        <TrendingDown size={14} />
      ) : (
        <AlertTriangle size={14} />
      )}
      {trend}
    </span>
  );
};
