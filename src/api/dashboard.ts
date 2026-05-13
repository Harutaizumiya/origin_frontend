import { CATEGORIES, TREND_DATA, URGENT_ITEMS } from "../constants/mockData";
import type { Category, DashboardStat, TrendDataPoint, UrgentItem } from "../types/inventory";

export interface DashboardData {
  stats: DashboardStat[];
  trendData: TrendDataPoint[];
  categories: Category[];
  urgentItems: UrgentItem[];
  lastUpdatedAt: string;
}

const DASHBOARD_DATA: DashboardData = {
  stats: [
    {
      id: "total-stock",
      title: "当前在库数量",
      value: "14,280",
      trend: "按可用批次汇总",
      trendType: "up",
      icon: "package",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "expiring-soon",
      title: "7天内临期批次",
      value: "18",
      trend: "需优先处理",
      trendType: "neutral",
      icon: "timer",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      id: "expired-batches",
      title: "已过期批次",
      value: "3",
      trend: "已排除空批次",
      trendType: "down",
      icon: "alert",
      iconBg: "bg-error/10",
      iconColor: "text-error",
    },
    {
      id: "health-index",
      title: "批次健康率",
      value: "91.6%",
      trend: "健康批次占比",
      trendType: "up",
      icon: "shield",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-600",
    },
  ],
  trendData: TREND_DATA,
  categories: CATEGORIES,
  urgentItems: URGENT_ITEMS,
  lastUpdatedAt: "14:32",
};

export function getDashboardSnapshot() {
  return DASHBOARD_DATA;
}

export async function getDashboardData() {
  return DASHBOARD_DATA;
}
