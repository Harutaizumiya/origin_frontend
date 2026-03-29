import React from "react";
import { motion } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

interface SidebarItemProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  to: string;
  active?: boolean;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  to,
  active = false,
}) => {
  const location = useLocation();
  const isActive = active || location.pathname === to;

  return (
    <Link to={to} className="relative block">
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isActive ? "rgba(255, 255, 255, 1)" : "transparent",
          marginLeft: isActive ? "1rem" : "0",
          borderRadius: isActive ? "9999px" : "0",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors group relative",
          isActive
            ? "text-primary font-bold shadow-sm"
            : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low",
        )}
      >
        <motion.div
          initial={false}
          animate={{
            opacity: isActive ? 1 : 0,
            width: isActive ? "3px" : "0",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-6 bg-primary rounded-r-full"
        />

        <motion.div
          initial={false}
          animate={{
            scale: isActive ? 1.1 : 1,
            color: isActive ? "var(--color-primary)" : "var(--color-on-surface-variant)",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        >
          <Icon
            size={20}
            className={cn(
              isActive ? "text-primary" : "text-on-surface-variant group-hover:text-primary",
            )}
          />
        </motion.div>

        <motion.span
          initial={false}
          animate={{ x: isActive ? 4 : 0 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className="font-headline text-sm tracking-tight"
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
};
