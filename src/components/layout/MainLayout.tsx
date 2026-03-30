import React, { useEffect, useState } from "react";
import { Header } from "./Header";
import { LayoutProvider } from "./LayoutContext";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_ANIMATION_MS = 300;

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);

  useEffect(() => {
    if (!isSidebarAnimating) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsSidebarAnimating(false);
    }, SIDEBAR_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [isSidebarAnimating, collapsed]);

  const handleToggle = () => {
    setIsSidebarAnimating(true);
    setCollapsed((current) => !current);
  };

  return (
    <LayoutProvider value={{ sidebarCollapsed: collapsed, isSidebarAnimating }}>
      <div className="flex min-h-screen bg-surface">
        <Sidebar collapsed={collapsed} onToggle={handleToggle} />
        <div className={collapsed ? "ml-20 flex-1 transition-all duration-300" : "ml-64 flex-1 transition-all duration-300"}>
          <Header />
          <main className="p-8 pb-24">{children}</main>
        </div>
      </div>
    </LayoutProvider>
  );
};
