import React from "react";

interface ProfileWidgetProps {
  collapsed: boolean;
}

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ collapsed }) => (
  <div
    className={
      collapsed
        ? "mt-4 flex items-center justify-center border-t border-surface-container px-3 pt-6"
        : "mt-4 flex items-center gap-3 border-t border-surface-container px-6 pt-6"
    }
  >
    <img
      alt="Manager Profile"
      className="h-8 w-8 rounded-full bg-slate-200 object-cover"
      src="https://picsum.photos/seed/manager/100/100"
      referrerPolicy="no-referrer"
    />
    {!collapsed && (
      <div className="overflow-hidden">
        <p className="truncate text-xs font-bold text-on-surface">Manager Profile</p>
        <p className="truncate text-[10px] text-on-surface-variant">Admin Access</p>
      </div>
    )}
  </div>
);
