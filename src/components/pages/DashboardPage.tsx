// 仪表盘主页面
// 包含所有仪表板功能组件

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData, getDashboardSnapshot } from "../../api/dashboard";
import { queryKeys } from "../../api/queryKeys";
import { PageHeader } from "../dashboard/PageHeader";
import { StatCardGrid } from "../dashboard/StatCardGrid";
import { ChartGrid } from "../charts/ChartGrid";
import { TableSection } from "../tables/TableSection";
import { FloatingActionButtons } from "../actions/FloatingActionButtons";

export const DashboardPage: React.FC = () => {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.dashboard.overview(),
    queryFn: getDashboardData,
    initialData: getDashboardSnapshot,
  });
  const dashboardData = dashboardQuery.data;

  return (
    <>
      <PageHeader />
      <StatCardGrid stats={dashboardData.stats} />
      <ChartGrid trendData={dashboardData.trendData} categories={dashboardData.categories} />
      <TableSection items={dashboardData.urgentItems} lastUpdatedAt={dashboardData.lastUpdatedAt} />
      <FloatingActionButtons />
    </>
  );
};
