// 仪表盘主页面
// 包含所有仪表板功能组件

import React from "react";
import { PageHeader } from "../dashboard/PageHeader";
import { StatCardGrid } from "../dashboard/StatCardGrid";
import { ChartGrid } from "../charts/ChartGrid";
import { TableSection } from "../tables/TableSection";
import { FloatingActionButtons } from "../actions/FloatingActionButtons";

export const DashboardPage: React.FC = () => {
  return (
    <>
      <PageHeader />
      <StatCardGrid />
      <ChartGrid />
      <TableSection />
      <FloatingActionButtons />
    </>
  );
};