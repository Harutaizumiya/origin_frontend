import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  LoaderCircle,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  getShelfLifeMetricsFromBatch,
  listExpiryAlerts,
  parseQuantity,
  type BatchDto,
  type ExpiryStatus,
} from "../../api";
import { cn } from "../../lib/utils";

const PAGE_SIZE = 10;

interface ExpiryAlertFilters {
  status: string;
  expiryStatus: string;
  daysLte: number;
}

const DEFAULT_FILTERS: ExpiryAlertFilters = {
  status: "",
  expiryStatus: "",
  daysLte: 30,
};

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

function getStatusBadge(expiryStatus: ExpiryStatus | null | undefined) {
  if (expiryStatus === "expired") {
    return {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: <AlertTriangle size={12} className="text-red-500" />,
      label: "已过期",
    };
  }
  if (expiryStatus === "critical") {
    return {
      className: "bg-red-50 text-red-600 border-red-200",
      icon: <AlertTriangle size={12} className="text-red-500" />,
      label: "紧急",
    };
  }
  if (expiryStatus === "warning") {
    return {
      className: "bg-orange-50 text-orange-600 border-orange-200",
      icon: <Clock size={12} className="text-orange-500" />,
      label: "临期",
    };
  }
  return {
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    icon: <CheckCircle2 size={12} className="text-emerald-500" />,
    label: "正常",
  };
}

function getStatusOptions() {
  return [
    { value: "", label: "全部状态" },
    { value: "unopened", label: "未开封" },
    { value: "opened", label: "已开封" },
    { value: "used_up", label: "已用完" },
  ];
}

function getExpiryStatusOptions() {
  return [
    { value: "", label: "全部风险" },
    { value: "expired", label: "已过期" },
    { value: "critical", label: "紧急" },
    { value: "warning", label: "临期" },
    { value: "normal", label: "正常" },
  ];
}

export const ExpiryAlertModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [batches, setBatches] = useState<BatchDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpiryAlertFilters>(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<ExpiryAlertFilters>(DEFAULT_FILTERS);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchAlerts = async (currentFilters: ExpiryAlertFilters, currentPage: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        page: currentPage,
        size: PAGE_SIZE,
      };

      if (currentFilters.status) {
        params.status = currentFilters.status;
      }
      if (currentFilters.expiryStatus) {
        params.expiry_status = currentFilters.expiryStatus;
      }
      params.days_lte = currentFilters.daysLte;

      const data = await listExpiryAlerts(params as Parameters<typeof listExpiryAlerts>[0]);
      setBatches(data.items);
      setTotal(data.pagination?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPage(1);
      setFilters(DEFAULT_FILTERS);
      setPendingFilters(DEFAULT_FILTERS);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchAlerts(filters, page);
    }
  }, [open, filters, page]);

  const handleApplyFilters = () => {
    setPage(1);
    setFilters({ ...pendingFilters });
  };

  const handleResetFilters = () => {
    setPendingFilters(DEFAULT_FILTERS);
    setPage(1);
    setFilters(DEFAULT_FILTERS);
  };

  const handleFilterChange = (field: keyof ExpiryAlertFilters, value: string | number) => {
    setPendingFilters((prev) => ({ ...prev, [field]: value }));
  };

  const summary = useMemo(() => {
    const expired = batches.filter((b) => b.expiry_status === "expired").length;
    const critical = batches.filter((b) => b.expiry_status === "critical").length;
    const warning = batches.filter((b) => b.expiry_status === "warning").length;
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
                <div className="flex flex-wrap items-end gap-4">
                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">批次状态</span>
                    <select
                      value={pendingFilters.status}
                      onChange={(e) => handleFilterChange("status", e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      {getStatusOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">风险等级</span>
                    <select
                      value={pendingFilters.expiryStatus}
                      onChange={(e) => handleFilterChange("expiryStatus", e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    >
                      {getExpiryStatusOptions().map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">剩余天数 ≤</span>
                    <input
                      type="number"
                      min={1}
                      value={pendingFilters.daysLte}
                      onChange={(e) => handleFilterChange("daysLte", Number(e.target.value) || 0)}
                      className="w-28 rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyFilters}
                      className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md"
                    >
                      <Search size={14} />
                      查询
                    </button>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>

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
                      onClick={() => fetchAlerts(filters, page)}
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
                        {batches.map((batch) => {
                          const metrics = getShelfLifeMetricsFromBatch(batch);
                          const statusBadge = getStatusBadge(batch.expiry_status);

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
                                        batch.expiry_status === "expired"
                                          ? "bg-red-600"
                                          : batch.expiry_status === "critical"
                                            ? "bg-red-500"
                                            : batch.expiry_status === "warning"
                                              ? "bg-orange-400"
                                              : "bg-sky-500",
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
                                    batch.expiry_status === "expired"
                                      ? "text-red-600"
                                      : batch.expiry_status === "critical"
                                        ? "text-red-500"
                                        : batch.expiry_status === "warning"
                                          ? "text-orange-500"
                                          : "text-on-surface",
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
