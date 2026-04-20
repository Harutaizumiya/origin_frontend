import React from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { SidebarMenu } from "../navigation/SidebarMenu";
import { ProfileWidget } from "../navigation/ProfileWidget";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => (
  <aside
    className={
      collapsed
        ? "fixed left-0 top-0 z-20 flex h-screen w-20 flex-col rounded-r-3xl bg-slate-100 py-6 shadow-xl transition-all duration-300"
        : "fixed left-0 top-0 z-20 flex h-screen w-64 flex-col rounded-r-3xl bg-slate-100 py-6 shadow-xl transition-all duration-300"
    }
  >
    <div className={collapsed ? "mb-8 px-3" : "mb-10 px-6"}>
      <div className={collapsed ? "flex items-center justify-center" : "flex items-center justify-between gap-3"}>
        <div className="min-w-0">
          <h1 className="font-headline text-lg font-bold tracking-tighter text-primary">{collapsed ? "" : "Origin"}</h1>
          {!collapsed && <p className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant">开发版</p>}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-colors hover:text-primary"
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>
    </div>

    <SidebarMenu collapsed={collapsed} />

    <ProfileWidget collapsed={collapsed} />
  </aside>
);
