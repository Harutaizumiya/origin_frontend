// 主布局组件
// 提供应用的整体布局结构，包含侧边栏、头部和主内容区域

import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface MainLayoutProps {
  children: React.ReactNode; // 子组件内容
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
  <div className="min-h-screen bg-surface flex">
    {/* 左侧固定侧边栏 */}
    <Sidebar />
    {/* 主内容区域，左侧留出侧边栏空间 */}
    <div className="flex-1 ml-64">
      {/* 顶部固定头部 */}
      <Header />
      {/* 主内容区，包含页面具体内容 */}
      <main className="p-8 pb-24">{children}</main>
    </div>
  </div>
);
