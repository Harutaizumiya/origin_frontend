import React from "react";


export const ProfileWidget: React.FC = () => (
  <div className="mt-auto px-6 pt-6 border-t border-surface-container flex items-center gap-3">
    <img
      alt="Manager Profile"
      className="w-8 h-8 rounded-full bg-slate-200 object-cover"
      src="https://picsum.photos/seed/manager/100/100"
      referrerPolicy="no-referrer"
    />
    <div className="overflow-hidden">
      <p className="text-xs font-bold text-on-surface truncate">
        Manager Profile
      </p>
      <p className="text-[10px] text-on-surface-variant truncate">
        Admin Access
      </p>
    </div>
  </div>
);
