import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  getShelfLifeMetricsFromDates,
  listBatches,
  parseQuantity,
  type BatchDto,
  type ExpiryStatus,
} from "../../api";
import { cn } from "../../lib/utils";

const PAGE_SIZE = 10;
const HEALTH_PRIORITY = {
  critical: 0,
  warning: 1,
} as const;

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatQuantity(quantity: string) {
  const numericValue = parseQuantity(quantity);
  return numericValue.toLocaleString("zh-CN", {
    minimumFractionDigits: quantity.includes(".") ? 1 : 0,
    maximumFractionDigits: 1,
  });
}

function isExpired(batch: BatchDto) {
  return batch.expire_date ? new Date(batch.expire_date).getTime() < Date.now() : false;
}

function getCardMetricsFromBatch(batch: BatchDto) {
  return getShelfLifeMetricsFromDates(
    batch.expire_date ?? batch.received_at,
    batch.manufacture_date ?? batch.received_at,
  );
}

function getAlertStatus(batch: BatchDto): Exclude<ExpiryStatus, "normal"> {
  const metrics = getCardMetricsFromBatch(batch);

  if (isExpired(batch)) {
    return "expired";
  }
  if (metrics.health === "critical") {
    return "critical";
  }
  return "warning";
}

function getStatusBadge(alertStatus: Exclude<ExpiryStatus, "normal">) {
  if (alertStatus === "expired") {
    return {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: <AlertTriangle size={12} className="text-red-500" />,
      label: "已过期",
    };
  }
  if (alertStatus === "critical") {
    return {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: <AlertTriangle size={12} className="text-red-500" />,
      label: "紧急",
    };
  }
  if (alertStatus === "warning") {
    return {
      className: "bg-orange-50 text-orange-600 border-orange-200",
      icon: <Clock size={12} className="text-orange-500" />,
      label: "临期",
    };
  }
}

export const ShelfLifeAlertModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pagedBatches = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return batches.slice(start, start + PAGE_SIZE);
  }, [batches, page]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: 1,
        size: 100,
      };

      const data = await listBatches(params as Parameters<typeof listBatches>[0]);
      const alertItems = data.items.filter((batch) => {
        return getCardMetricsFromBatch(batch).health !== "healthy";
      }).sort((left, right) => {
        const leftMetrics = getCardMetricsFromBatch(left);
        const rightMetrics = getCardMetricsFromBatch(right);
        const healthDiff = HEALTH_PRIORITY[leftMetrics.health as keyof typeof HEALTH_PRIORITY] - HEALTH_PRIORITY[rightMetrics.health as keyof typeof HEALTH_PRIORITY];

        if (healthDiff !== 0) {
          return healthDiff;
        }

        return new Date(left.expire_date ?? left.received_at).getTime() - new Date(right.expire_date ?? right.received_at).getTime();
      });

      setBatches(alertItems);
      setTotal(alertItems.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchAlerts();
    }
  }, [open]);

  const summary = useMemo(() => {
    const statuses = batches.map(getAlertStatus);
    const expired = statuses.filter((status) => status === "expired").length;
    const critical = statuses.filter((status) => status === "critical").length;
    const warning = statuses.filter((status) => status === "warning").length;
    return { expired, critical, warning, total: batches.length };
  }, [batches]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="ambient-shadow pointer-events-auto relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest"
            >
              <div className="flex items-start justify-between border-b border-surface-container-high px-8 py-6">
                <div>
                  <h2 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">效期预警</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {isLoading
                      ? "正在查询临期/过期批次..."
                      : `共 ${total} 条记录，当前显示 ${summary.warning + summary.critical + summary.expired} 条预警批次`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-primary"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-surface-container-high px-8 py-5">
                <p className="text-sm text-on-surface-variant">默认展示当前临期、紧急和已过期批次。</p>

                {!isLoading && summary.total > 0 && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {summary.expired > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        <AlertTriangle size={12} />已过期 {summary.expired} 条
                      </span>
                    )}
                    {summary.critical > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                        <AlertTriangle size={12} />紧急 {summary.critical} 条
                      </span>
                    )}
                    {summary.warning > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                        <Clock size={12} />临期 {summary.warning} 条
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                    <LoaderCircle size={28} className="animate-spin text-on-surface-variant" />
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">正在查询效期预警数据</h4>
                      <p className="mt-1 text-sm text-on-surface-variant">请确认 Django 服务已启动，并且接口可正常访问。</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                    <div className="text-red-500">
                      <AlertTriangle size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">加载失败</h4>
                      <p className="mt-1 text-sm text-on-surface-variant">{error}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchAlerts()}
                      className="rounded-2xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      重试
                    </button>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-on-surface">暂无预警批次</h4>
                      <p className="mt-1 text-sm text-on-surface-variant">当前筛选条件下没有临期或过期批次，库存状态良好。</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-container-low/50">
                          <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">商品 / 批次</th>
                          <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">厂商</th>
                          <th className="px-8 py-4 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">数量</th>
                          <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">生产日期</th>
                          <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">到期日期</th>
                          <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">效期进度</th>
                          <th className="px-8 py-4 text-right text-xs font-bold uppercase tracking-wider text-on-surface-variant">剩余天数</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {pagedBatches.map((batch) => {
                          const metrics = getCardMetricsFromBatch(batch);
                          const alertStatus = getAlertStatus(batch);
                          const statusBadge = getStatusBadge(alertStatus);

                          return (
                            <tr key={batch.id} className="transition-colors hover:bg-surface-container-low/30">
                              <td className="px-8 py-5">
                                <div className="font-bold text-on-surface">{batch.product.product_name}</div>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-xs font-mono text-on-surface-variant">{batch.batch_code}</span>
                                  <span
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                                      statusBadge.className,
                                    )}
                                  >
                                    {statusBadge.icon}
                                    {statusBadge.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-sm text-on-surface-variant">{batch.product.manufacturer}</td>
                              <td className="px-8 py-5 text-center font-bold text-on-surface">{formatQuantity(batch.quantity)}</td>
                              <td className="px-8 py-5 text-sm text-on-surface-variant">
                                {batch.manufacture_date ? formatDate(batch.manufacture_date) : "-"}
                              </td>
                              <td className="px-8 py-5 text-sm text-on-surface-variant">
                                {batch.expire_date ? formatDate(batch.expire_date) : "-"}
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex min-w-[160px] items-center gap-3">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        alertStatus === "expired"
                                          ? "bg-red-600"
                                          : alertStatus === "critical"
                                            ? "bg-red-500"
                                            : "bg-orange-400",
                                      )}
                                      style={{ width: `${metrics.percent}%` }}
                                    />
                                  </div>
                                  <span className="w-9 text-right text-xs font-bold text-on-surface-variant">{metrics.percent}%</span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <span
                                  className={cn(
                                    "text-sm font-bold",
                                    alertStatus === "expired"
                                      ? "text-red-600"
                                      : alertStatus === "critical"
                                        ? "text-red-500"
                                        : "text-orange-500",
                                  )}
                                >
                                  {batch.days_until_expiry !== null && batch.days_until_expiry !== undefined
                                    ? `${batch.days_until_expiry} 天`
                                    : "-"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {batches.length > 0 && (
                <div className="flex items-center justify-between gap-4 border-t border-surface-container-high px-8 py-5">
                  <div className="text-sm text-on-surface-variant">
                    第 <span className="font-bold text-on-surface">{page}</span> / {totalPages} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((p) => p - 1)}
                      disabled={page === 1}
                      className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                      上一页
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        if (totalPages <= 7) return true;
                        return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                      })
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-sm text-on-surface-variant">...</span>
                          )}
                          <button
                            type="button"
                            onClick={() => setPage(p)}
                            className={cn(
                              "h-10 w-10 rounded-xl text-sm font-bold transition-all",
                              p === page
                                ? "bg-primary text-white shadow-sm"
                                : "bg-surface-container-low text-on-surface-variant hover:text-primary",
                            )}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === totalPages}
                      className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      下一页
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
