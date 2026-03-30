import React, { createContext, useContext } from "react";

interface LayoutContextValue {
  sidebarCollapsed: boolean;
  isSidebarAnimating: boolean;
}

const LayoutContext = createContext<LayoutContextValue>({
  sidebarCollapsed: false,
  isSidebarAnimating: false,
});

export const LayoutProvider = LayoutContext.Provider;

export function useLayoutContext() {
  return useContext(LayoutContext);
}
