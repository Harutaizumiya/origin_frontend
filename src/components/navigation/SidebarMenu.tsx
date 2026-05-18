import React from "react";
import { ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";
import { footerMenuRoutes, mainMenuRoutes, settingsRootRoute } from "../../routes/appRoutes";
import { canAccessRoute } from "../../routes/routeAccess";
import { SidebarItem } from "./SidebarItem";

interface SidebarMenuProps {
  collapsed: boolean;
}

export const SidebarMenu: React.FC<SidebarMenuProps> = ({ collapsed }) => {
  const { user } = useAuth();
  const location = useLocation();
  const visibleMainRoutes = mainMenuRoutes.filter((route) => canAccessRoute(user, route));
  const visibleSettingsRoutes = footerMenuRoutes.filter((route) => canAccessRoute(user, route));
  const settingsActive = location.pathname.startsWith("/settings");

  return (
    <nav className="flex flex-1 flex-col">
      <div className="space-y-1">
        {visibleMainRoutes.map((route) => (
          <SidebarItem key={route.path} collapsed={collapsed} icon={route.icon} label={route.label} to={route.path} />
        ))}
      </div>
      <div className="mt-auto space-y-1 pt-2">
        <SidebarItem
          collapsed={collapsed}
          icon={settingsRootRoute.icon}
          label={settingsRootRoute.label}
          to={settingsRootRoute.path}
          active={settingsActive}
          trailingIcon={collapsed ? undefined : <ChevronDown size={14} className="text-on-surface-variant" />}
        />
        {!collapsed ? (
          <div className="ml-7 space-y-1 border-l border-surface-container pl-3">
            {visibleSettingsRoutes.map((route) => (
              <SidebarItem key={route.path} collapsed={false} compact icon={route.icon} label={route.label} to={route.path} />
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
};
