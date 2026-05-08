import React, { memo } from "react";
import { motion } from "motion/react";
import type { StatCardProps } from "../../types/inventory";
import { cn } from "../../lib/utils";
import { TrendBadge } from "../common/TrendBadge";

export const StatCard = memo(function StatCard({
  title,
  value,
  trend,
  trendType,
  icon: Icon,
  iconBg,
  iconColor,
}: StatCardProps) {
  return (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-surface-container-lowest p-6 rounded-3xl ambient-shadow border border-surface-container/10"
  >
    <div className="flex justify-between items-start mb-4">
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center",
          iconBg,
          iconColor,
        )}
      >
        {Icon}
      </div>
      <TrendBadge trend={trend} trendType={trendType} />
    </div>
    <p className="text-sm font-medium text-on-surface-variant">{title}</p>
    <h3 className="text-2xl font-bold mt-1 text-on-surface font-headline">
      {value}
    </h3>
  </motion.div>
  );
});
