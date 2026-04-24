import React from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  to: string;
  collapsed: boolean;
  active?: boolean;
}

const SIDEBAR_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

export const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, to, collapsed, active = false }) => {
  const location = useLocation();
  const isActive = active || location.pathname === to;

  return (
    <Link to={to} className="relative block">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isActive ? "rgba(255, 255, 255, 1)" : "transparent",
          marginLeft: isActive && !collapsed ? "1rem" : isActive ? "0.5rem" : "0",
          marginRight: collapsed ? "0.5rem" : "0",
          borderRadius: "9999px",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "flex items-center px-4 py-3",
          collapsed ? "justify-center" : "gap-3",
          isActive
            ? "font-bold text-primary shadow-sm"
            : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary",
        )}
        title={collapsed ? label : undefined}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            width: isActive ? "3px" : "0",
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-primary"
        />

        <motion.div
          initial={false}
          animate={{
            scale: isActive ? 1.08 : 1,
            color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
        >
          <Icon size={20} className={cn(isActive ? "text-primary" : "text-on-surface-variant")} />
        </motion.div>

        <span
          className={cn(
            "overflow-hidden whitespace-nowrap font-headline text-sm tracking-tight transition-[max-width,opacity,transform] duration-500",
            collapsed ? "max-w-0 -translate-x-2 opacity-0" : "max-w-[120px] translate-x-0 opacity-100",
          )}
          style={{ transitionTimingFunction: SIDEBAR_EASING }}
        >
          {label}
        </span>
      </motion.div>
    </Link>
  );
};
