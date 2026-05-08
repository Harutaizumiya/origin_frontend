import React, { memo } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { Category } from "../../types/inventory";

interface DistributionChartProps {
  categories: Category[];
}

export const DistributionChart = memo(function DistributionChart({ categories }: DistributionChartProps) {
  return (
  <div className="space-y-6">
    {categories.map((cat) => (
      <div key={cat.name} className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-on-surface-variant">{cat.name}</span>
          <span className="font-bold text-on-surface">{cat.percentage}%</span>
        </div>
        <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cat.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", cat.color)}
          />
        </div>
      </div>
    ))}
    <div className="mt-8 pt-6 border-t border-surface-container-high flex justify-center">
      <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
        查看详细清单 <ArrowRight size={14} />
      </button>
    </div>
  </div>
  );
});
