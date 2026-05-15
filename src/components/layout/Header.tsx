import React, { useEffect, useRef, useState } from "react";
import { Bell, HelpCircle } from "lucide-react";

const HEADER_HEIGHT_PX = 64;
const HEADER_HIDE_THRESHOLD_PX = 160;
const SIDEBAR_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

interface HeaderProps {
  sidebarWidth: number;
}

export const Header: React.FC<HeaderProps> = ({ sidebarWidth }) => {
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (tickingRef.current) {
        return;
      }

      tickingRef.current = true;

      window.requestAnimationFrame(() => {
        const nextScrollY = window.scrollY;
        const scrollingUp = nextScrollY < lastScrollYRef.current;
        const scrollingDown = nextScrollY > lastScrollYRef.current;

        if (nextScrollY <= HEADER_HIDE_THRESHOLD_PX) {
          setVisible(true);
        } else if (scrollingUp) {
          setVisible(true);
        } else if (scrollingDown) {
          setVisible(false);
        }

        lastScrollYRef.current = nextScrollY;
        tickingRef.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{
        left: sidebarWidth,
        height: visible ? HEADER_HEIGHT_PX : 0,
        transitionTimingFunction: SIDEBAR_EASING,
      }}
      className="glass-header fixed right-0 top-0 z-30 overflow-hidden border-surface-container/50 transition-[left,height,border-color] duration-500"
    >
      <div
        className="flex h-16 items-center justify-between px-8 transition-[transform,opacity] duration-300"
        style={{ transform: visible ? "translateY(0)" : "translateY(-100%)", opacity: visible ? 1 : 0 }}
      >
        <div className="flex-1" />

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
      </div>
    </header>
  );
};
