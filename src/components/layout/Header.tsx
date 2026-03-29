import React from "react";
import { Search, Bell, HelpCircle } from "lucide-react";

export const Header: React.FC = () => (
  <header className="sticky top-0 z-10 glass-header border-b border-surface-container/50 flex justify-between items-center h-16 px-8">
    <div className="flex items-center gap-4 flex-1">
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          className="w-full pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          placeholder="搜索库存、批次或供应商..."
          type="text"
        />
      </div>
    </div>

    <div className="flex items-center gap-6">
      <div className="flex items-center gap-4 border-r border-surface-container pr-6">
        <button className="relative text-on-surface-variant hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-on-surface">库存管理系统</p>
        <p className="text-[10px] text-on-surface-variant">2024年5月24日</p>
      </div>
    </div>
  </header>
);
