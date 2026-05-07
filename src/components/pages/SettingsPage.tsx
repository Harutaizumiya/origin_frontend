import React from "react";
import { OperationAlertGallery } from "../common/OperationAlert";

export const SettingsPage: React.FC = () => (
  <div className="mx-auto max-w-5xl">
    <div className="mb-8">
      <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">操作提示</h2>
      <p className="mt-1 text-on-surface-variant">这是一组基于当前项目设计 token 和 Lucide 图标体系构建的提示组件示例。</p>
    </div>

    <section className="ambient-shadow rounded-3xl border border-surface-container/10 bg-surface-container-lowest p-8">
      <OperationAlertGallery />
    </section>
  </div>
);
