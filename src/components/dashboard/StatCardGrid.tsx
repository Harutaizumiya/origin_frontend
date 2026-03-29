import React from "react";
import { AlertTriangle, Package, ShieldCheck, Timer } from "lucide-react";
import { StatCard } from "./StatCard";

export const StatCardGrid: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard
      title="总库存件数"
      value="14,280"
      trend="+12.5%"
      trendType="up"
      icon={<Package size={24} />}
      iconBg="bg-primary/10"
      iconColor="text-primary"
    />
    <StatCard
      title="即将过期（7天内）"
      value="432"
      trend="注意"
      trendType="neutral"
      icon={<Timer size={24} />}
      iconBg="bg-amber-500/10"
      iconColor="text-amber-600"
    />
    <StatCard
      title="已过期商品"
      value="28"
      trend="-2.4%"
      trendType="down"
      icon={<AlertTriangle size={24} />}
      iconBg="bg-error/10"
      iconColor="text-error"
    />
    <StatCard
      title="库存健康指数"
      value="96.8%"
      trend="优"
      trendType="up"
      icon={<ShieldCheck size={24} />}
      iconBg="bg-green-500/10"
      iconColor="text-green-600"
    />
  </div>
);
