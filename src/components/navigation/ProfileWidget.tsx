import React from "react";
import { cn } from "../../lib/utils";

interface ProfileWidgetProps {
  collapsed: boolean;
}

const SIDEBAR_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export const ProfileWidget: React.FC<ProfileWidgetProps> = ({ collapsed }) => (
  <div
    className={cn(
      "mt-4 flex border-t border-surface-container px-4 pt-6",
      collapsed ? "items-center justify-center" : "items-center gap-3",
    )}
  >
    <img
      alt="Manager Profile"
      className="h-8 w-8 rounded-full bg-slate-200 object-cover"
      src="https://picsum.photos/seed/manager/100/100"
      referrerPolicy="no-referrer"
    />
    <div
      className={cn(
        "overflow-hidden transition-[max-width,opacity,transform] duration-500",
        collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[140px] translate-x-0 opacity-100",
      )}
      style={{ transitionTimingFunction: SIDEBAR_EASING }}
    >
      <p className="truncate text-xs font-bold text-on-surface">Manager Profile</p>
      <p className="truncate text-[10px] text-on-surface-variant">Admin Access</p>
    </div>
  </div>
);
