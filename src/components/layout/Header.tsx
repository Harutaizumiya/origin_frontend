import React from "react";
import { Bell, HelpCircle, Search } from "lucide-react";

export const Header: React.FC = () => (
  <header className="glass-header sticky top-0 z-10 flex h-16 items-center justify-between border-b border-surface-container/50 px-8">
    <div className="flex flex-1 items-center gap-4">
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          className="w-full rounded-xl border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20"
          placeholder="搜索库存、批次或供应商..."
          type="text"
        />
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 border-r border-surface-container pr-6">
        <button className="relative text-on-surface-variant transition-colors hover:text-primary">
          <Bell size={20} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full border-2 border-white bg-error" />
        </button>
        <button className="text-on-surface-variant transition-colors hover:text-primary">
          <HelpCircle size={20} />
        </button>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-on-surface">库存管理系统</p>
        <p className="text-[10px] text-on-surface-variant">{new Date().toLocaleDateString("zh-CN")}</p>
      </div>
    </div>
  </header>
);
