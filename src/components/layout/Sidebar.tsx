import React from "react";
import { SettingOutlined } from "@ant-design/icons";
import { SidebarMenu } from "../navigation/SidebarMenu";
import { ProfileWidget } from "../navigation/ProfileWidget";

export const Sidebar: React.FC = () => (
  <aside className="h-screen w-64 fixed left-0 top-0 bg-slate-120 flex flex-col py-6 z-20 shadow-xl">
    <div className="px-6 mb-10">
      <h1 className="text-lg font-bold text-primary tracking-tighter font-headline">
        Origin
      </h1>
      <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
        开发版
      </p>
    </div>

    <SidebarMenu />

    <div className="mt-auto px-6 hover:bg-slate-100">
      <button className="flex items-center gap-3 w-full p-3 rounded-lg transition-colors">
        <SettingOutlined className="text-2xl transition-transform duration-300 ease-in-out hover:rotate-90 hover:scale-125 cursor-pointer inline-block text-slate-600" />
        <span className="text-sm w-full font-medium text-slate-600">设置</span>
      </button>
    </div>

    <ProfileWidget />
  </aside>
);
