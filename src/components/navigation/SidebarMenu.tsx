import React from "react";
import { BarChart3, LayoutDashboard, Package } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

export const SidebarMenu: React.FC = () => (
  <nav className="flex-1 space-y-1">
    <SidebarItem icon={LayoutDashboard} label="总览" to="/" />
    <SidebarItem icon={Package} label="库存状态" to="/inventory-status" />
    <SidebarItem icon={BarChart3} label="分析" to="/analysis" />
  </nav>
);
