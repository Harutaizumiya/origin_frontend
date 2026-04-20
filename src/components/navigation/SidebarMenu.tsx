import React from "react";
import { BarChart3, Boxes, LayoutDashboard, Package, Settings } from "lucide-react";
import { SidebarItem } from "./SidebarItem";

interface SidebarMenuProps {
  collapsed: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => (
  <nav className="flex flex-1 flex-col">
    <div className="space-y-1">
      <SidebarItem collapsed={collapsed} icon={LayoutDashboard} label="总览" to="/" />
      <SidebarItem collapsed={collapsed} icon={Boxes} label="货物管理" to="/products" />
      <SidebarItem collapsed={collapsed} icon={Package} label="库存状态" to="/inventory-status" />
      <SidebarItem collapsed={collapsed} icon={BarChart3} label="分析" to="/analysis" />
    </div>
    <div className="mt-auto pt-2">
      <SidebarItem collapsed={collapsed} icon={Settings} label="设置" to="/settings" />
    </div>
  </nav>
);
