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
      title: "总库存件数",
      value: "14,280",
      trend: "+12.5%",
      trendType: "up",
      icon: "package",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      id: "expiring-soon",
      title: "即将过期（7天内）",
      value: "432",
      trend: "注意",
      trendType: "neutral",
      icon: "timer",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-600",
    },
    {
      id: "expired-products",
      title: "已过期商品",
      value: "28",
      trend: "-2.4%",
      trendType: "down",
      icon: "alert",
      iconBg: "bg-error/10",
      iconColor: "text-error",
    },
    {
      id: "health-index",
      title: "库存健康指数",
      value: "96.8%",
      trend: "优",
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
