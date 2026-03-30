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
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={cn(
          collapsed ? "flex items-center justify-center px-3 py-3" : "flex items-center gap-3 px-4 py-3",
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
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-r-full bg-primary"
        />

        <motion.div
          initial={false}
          animate={{
            scale: isActive ? 1.1 : 1,
            color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Icon size={20} className={cn(isActive ? "text-primary" : "text-on-surface-variant group-hover:text-primary")} />
        </motion.div>

        {!collapsed && (
          <motion.span
            initial={false}
            animate={{ x: isActive ? 4 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="font-headline text-sm tracking-tight"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};
