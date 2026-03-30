import React from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { cn } from "../../lib/utils";
import type {
  InventoryHealthMeta,
  InventoryRecord,
  ShelfLifeMetrics,
} from "./InventoryStatus.types";

interface InventoryStatusCardProps {
  item: InventoryRecord;
  metrics: ShelfLifeMetrics;
  meta: InventoryHealthMeta;
  formatDate: (date: string) => string;
  formatQuantity: (quantity: string) => string;
  onOpenDetail: (item: InventoryRecord) => void;
}

export const InventoryStatusCard: React.FC<InventoryStatusCardProps> = ({
  item,
  metrics,
  meta,
  formatDate,
  formatQuantity,
  onOpenDetail,
}) => {
  const isCritical = metrics.health === "critical";

  return (
    <article
      className={cn(
        "group relative flex aspect-square min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white px-3 pb-2.5 pt-3 transition-all hover:-translate-y-1 cursor-pointer",
      )}
    >
      {isCritical && (
        <div
        className="pointer-events-none absolute rounded-3xl inset-[-1px] border-3 border-red-400 animate-pulse shadow-[inset_0_0_10px_rgba(239,68,68,0.2)]"
          style={{ animationDuration: "2.5s" }}
        />
      )}

      <div
        className={cn("absolute inset-x-0 bottom-0 h-1.5", meta.lineClassName)}
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
            <span>数量 {formatQuantity(item.quantity)}</span>
            <span className="text-slate-300">|</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
              {item.category}
            </span>
          </div>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-slate-900">
            {item.productName}
          </h3>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-semibold",
            meta.tagClassName,
          )}
        >
          {meta.icon}
          {meta.label}
        </span>
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-1.5 text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
          {item.manufacturer}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px]">
          {item.location}
        </span>
      </div>

      <div className="mb-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2.5">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>剩余效期</span>
          <span className="font-semibold text-slate-700">
            {metrics.percent}%
          </span>
        </div>
        <div className="relative h-1.5 rounded-full bg-slate-200">
          <div
            className={cn("h-1.5 rounded-full transition-all", meta.progress)}
            style={{ width: `${metrics.percent}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between gap-2">
          <div>
            <div className="text-[10px] text-slate-400">生产日期</div>
            <div className="mt-0.5 text-[12px] font-semibold text-slate-900">
              {formatDate(item.manufactureDate)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">到期日期</div>
            <div className="mt-0.5 text-[12px] font-semibold text-slate-900">
              {formatDate(item.expireDate)}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2 text-slate-500">
        <div>
          <div className="mb-0.5 text-[10px] text-slate-400">收货日期</div>
          <div className="text-[12px] font-semibold text-slate-900">
            {formatDate(item.receivedDate)}
          </div>
        </div>
        <div className="text-right">
          <div className="mb-0.5 text-[10px] text-slate-400">剩余天数</div>
          <div className="text-[12px] font-semibold text-slate-900">
            {metrics.remainingDays} 天
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-left transition-colors hover:text-primary cursor-pointer"
      >
        <div className="min-w-0">
          <div className="truncate text-[12px] font-semibold text-slate-900">
            {item.location}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">查看批次详情</div>
        </div>
        <span
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-[12px] text-white transition-all hover:bg-primary"
          onClick={() => onOpenDetail(item)}
        >
          <ArrowRightOutlined />
        </span>
      </button>
    </article>
  );
};
