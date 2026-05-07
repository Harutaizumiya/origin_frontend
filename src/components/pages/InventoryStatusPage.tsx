import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, CircleAlert, CircleCheckBig, Clock3, LayoutDashboard, LayoutGrid, List, LoaderCircle, Package, Plus, Search, ShieldCheck, TriangleAlert, X } from "lucide-react";
import {
  ApiClientError,
  buildInventoryDetail,
  createBatch,
  getShelfLifeMetricsFromDates,
  listBatches,
  listProductBatches,
  listProducts,
  mergeInventoryRecord,
  parseQuantity,
  queryKeys,
  toInventoryRecord,
} from "../../api";
import { cn } from "../../lib/utils";
import { FloatingActionButtons } from "../actions/FloatingActionButtons";
import { StatCard } from "../dashboard/StatCard";
import { InventoryBatchDetailModal } from "./InventoryBatchDetailModal";
import { InventoryStatusCard } from "./InventoryStatusCard";
import type { Product } from "./ProductManagement.types";
import type { InventoryBatchDetail, InventoryHealth, InventoryHealthMeta, InventoryRecord, ShelfLifeMetrics } from "./InventoryStatus.types";

type InventoryView = "card" | "list";

interface NewBatchFormState {
  query: string;
  quantity: string;
  manufactureDate: string;
  remarks: string;
}

const LIST_PAGE_SIZE = 6;
const CARD_MIN_WIDTH = 280;
const CARD_GRID_GAP = 16;
const CARD_ROWS_PER_PAGE = 2;
const QUERY_STALE_TIME_MS = 5 * 60 * 1000;
const QUERY_GC_TIME_MS = 30 * 60 * 1000;
const PRODUCT_OPTION_LIST_HEIGHT = 180;
const DEFAULT_NEW_BATCH_FORM: NewBatchFormState = {
  query: "",
  quantity: "",
  manufactureDate: new Date().toISOString().slice(0, 10),
  remarks: "",
};
function formatQuantity(quantity: string) {
  const numericValue = parseQuantity(quantity);
  return numericValue.toLocaleString("zh-CN", {
    minimumFractionDigits: quantity.includes(".") ? 1 : 0,
    maximumFractionDigits: 1,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getShelfLifeMetrics(item: InventoryRecord): ShelfLifeMetrics {
  return getShelfLifeMetricsFromDates(item.expireDate, item.manufactureDate);
}

function getHealthMeta(health: InventoryHealth): InventoryHealthMeta {
  if (health === "critical") {
    return {
      label: "高风险",
      hint: "建议优先处理该批次",
      tagClassName: "bg-red-50 text-red-500 border-red-200",
      lineClassName: "bg-red-500",
      icon: <CircleAlert size={14} className="text-red-500" />,
      progress: "bg-red-500",
    };
  }

  if (health === "warning") {
    return {
      label: "临期预警",
      hint: "请关注剩余效期",
      tagClassName: "bg-orange-50 text-orange-500 border-orange-200",
      lineClassName: "bg-orange-400",
      icon: <Clock3 size={14} className="text-orange-500" />,
      progress: "bg-orange-400",
    };
  }

  return {
    label: "效期健康",
    hint: "批次效期处于安全区间",
    tagClassName: "bg-blue-50 text-blue-500 border-blue-200",
    lineClassName: "bg-sky-500",
    icon: <CircleCheckBig size={14} className="text-sky-500" />,
    progress: "bg-sky-500",
  };
}

function sortInventoryItems(items: InventoryRecord[]) {
  return [...items].sort((left, right) => {
    const leftMetrics = getShelfLifeMetrics(left);
    const rightMetrics = getShelfLifeMetrics(right);
    const remainingDaysDiff = leftMetrics.remainingDays - rightMetrics.remainingDays;

    if (remainingDaysDiff !== 0) {
      return remainingDaysDiff;
    }

    return left.productName.localeCompare(right.productName, "zh-CN");
  });
}

function getCardPageSize(containerWidth: number) {
  if (containerWidth <= 0) {
    return LIST_PAGE_SIZE;
  }

  const columnCount = Math.max(1, Math.floor((containerWidth + CARD_GRID_GAP) / (CARD_MIN_WIDTH + CARD_GRID_GAP)));
  return columnCount * CARD_ROWS_PER_PAGE;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    switch (error.message) {
      case "validation_error":
        return "请求参数不符合后端校验规则。";
      case "conflict":
        return "数据冲突，请检查批次或商品信息。";
      case "not_found":
        return "目标数据不存在。";
      default:
        return `请求失败：${error.message}`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "请求失败，请稍后重试。";
}

function InventoryOverviewCards({ items }: { items: InventoryRecord[] }) {
  const itemMetrics = items.map((item) => getShelfLifeMetrics(item));
  const totalQuantity = items.reduce((sum, item) => sum + parseQuantity(item.quantity), 0);
  const riskBatchCount = itemMetrics.filter((metric) => metric.health !== "healthy").length;
  const healthyRate = Math.round(
    (itemMetrics.filter((metric) => metric.health === "healthy").length / Math.max(items.length, 1)) * 100,
  );

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="批次总数量"
        value={totalQuantity.toLocaleString("zh-CN", { maximumFractionDigits: 1 })}
        trend="按批次汇总"
        trendType="up"
        icon={<Package size={24} />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        title="临期批次"
        value={String(riskBatchCount)}
        trend="需优先关注"
        trendType="neutral"
        icon={<Clock3 size={24} className="text-orange-500" />}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-600"
      />
      <StatCard
        title="异常批次"
        value={String(riskBatchCount)}
        trend="需及时处理"
        trendType="critical"
        icon={<TriangleAlert size={24} />}
        iconBg="bg-red-500/10"
        iconColor="text-red-600"
      />
      <StatCard
        title="健康批次占比"
        value={`${healthyRate}%`}
        trend="效期安全率"
        trendType="up"
        icon={<ShieldCheck size={24} />}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />
    </div>
  );
}

function NewBatchModal({
  open,
  form,
  submitting,
  selectedProduct,
  searchResults,
  error,
  onChange,
  onSelectProduct,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: NewBatchFormState;
  submitting: boolean;
  selectedProduct: Product | null;
  searchResults: Product[];
  error: string | null;
  onChange: (field: keyof NewBatchFormState, value: string) => void;
  onSelectProduct: (product: Product) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[3px]"
            onClick={submitting ? undefined : onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="ambient-shadow pointer-events-auto relative flex w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest"
            >
              <div className="flex items-start justify-between border-b border-surface-container-high px-8 py-5">
                <div>
                  <h3 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">新建批次</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">当前操作会直接调用 Django `/batches` 接口。</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 px-8 py-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">搜索货物</label>
                  <div className="relative">
                    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      value={form.query}
                      onChange={(event) => onChange("query", event.target.value)}
                      placeholder="按货物名、条码或厂商搜索"
                      className="w-full rounded-2xl border border-slate-200 bg-surface-container-low py-3 pl-11 pr-12 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                    {form.query ? (
                      <button
                        type="button"
                        onClick={() => onChange("query", "")}
                        className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-white hover:text-primary"
                        aria-label="清空搜索"
                        title="清空搜索"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">候选货物</div>
                  <div
                    className="overflow-y-auto pr-1"
                    style={{ height: `${PRODUCT_OPTION_LIST_HEIGHT}px` }}
                  >
                      {searchResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {searchResults.map((product) => {
                            const selected = selectedProduct?.id === product.id;
                            return (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => onSelectProduct(product)}
                                className={cn(
                                  "min-h-[84px] rounded-2xl border px-4 py-3 text-left transition-all",
                                  selected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-primary/30 hover:bg-primary/5",
                                )}
                              >
                                <div className="truncate font-bold text-on-surface">{product.product_name}</div>
                                <div className="mt-1 truncate text-xs text-on-surface-variant">{product.barcode}</div>
                                <div className="mt-1 truncate text-xs text-on-surface-variant">
                                  {product.manufacturer} · {product.location ?? "未分配库位"}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-on-surface-variant">
                          未找到匹配货物。
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-1">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-on-surface">数量 *</span>
                        <input
                          value={form.quantity}
                          onChange={(event) => onChange("quantity", event.target.value)}
                          placeholder="例如 8.50"
                          className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-on-surface">生产日期 *</span>
                        <input
                          type="date"
                          value={form.manufactureDate}
                          onChange={(event) => onChange("manufactureDate", event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                        />
                      </label>
                    </div>
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface">备注</span>
                      <textarea
                        value={form.remarks}
                        onChange={(event) => onChange("remarks", event.target.value)}
                        rows={2}
                        className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                        placeholder="可选"
                      />
                    </label>

                    {selectedProduct ? (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        已选择：{selectedProduct.product_name} · 保质期 {selectedProduct.shelf_life_days} 天
                      </div>
                    ) : null}

                    {error ? (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-surface-container-high pt-5">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                    创建批次
                  </button>
                </div>
              </div>
            </motion.section>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function InventoryCardView({
  items,
  gridRef,
  onOpenDetail,
}: {
  items: InventoryRecord[];
  gridRef?: React.Ref<HTMLDivElement>;
  onOpenDetail: (item: InventoryRecord) => void;
}) {
  return (
    <div
      ref={gridRef}
      className="grid justify-items-start gap-4"
      style={{ gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${CARD_MIN_WIDTH}px), 1fr))` }}
    >
      {items.map((item) => {
        const metrics = getShelfLifeMetrics(item);
        const meta = getHealthMeta(metrics.health);

        return (
          <InventoryStatusCard
            key={item.id}
            item={item}
            metrics={metrics}
            meta={meta}
            formatDate={formatDate}
            formatQuantity={formatQuantity}
            onOpenDetail={onOpenDetail}
          />
        );
      })}
    </div>
  );
}

function InventoryListView({
  items,
  onOpenDetail,
}: {
  items: InventoryRecord[];
  onOpenDetail: (item: InventoryRecord) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">商品</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">供应商</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">库位</th>
            <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">数量</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">生产日期</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">到期日期</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">剩余效期</th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">收货日期</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">
          {items.map((item) => {
            const metrics = getShelfLifeMetrics(item);
            const meta = getHealthMeta(metrics.health);

            return (
              <tr key={item.id} className="transition-colors hover:bg-surface-container-low/30">
                <td className="px-6 py-5">
                  <button type="button" onClick={() => onOpenDetail(item)} className="text-left">
                    <div className="font-bold text-on-surface transition-colors hover:text-primary">{item.productName}</div>
                    <div className="mt-1 text-xs text-on-surface-variant">查看批次详情 · {item.category}</div>
                  </button>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{item.manufacturer}</td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{item.location}</td>
                <td className="px-6 py-5 text-center font-bold text-on-surface">{formatQuantity(item.quantity)}</td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(item.manufactureDate)}</td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(item.expireDate)}</td>
                <td className="px-6 py-5">
                  <div className="flex min-w-[180px] flex-col gap-2">
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span>{metrics.remainingDays} 天</span>
                      <span>{metrics.percent}%</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-slate-200">
                      <div className={cn("h-2 rounded-full transition-all", meta.progress)} style={{ width: `${metrics.percent}%` }} />
                    </div>
                    <span className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold", meta.tagClassName)}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{formatDate(item.receivedDate)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ViewToggle({
  view,
  onChange,
}: {
  view: InventoryView;
  onChange: (nextView: InventoryView) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
      <button
        type="button"
        onClick={() => onChange("card")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
          view === "card" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary",
        )}
      >
        <LayoutGrid size={16} />
        卡片视图
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
          view === "list" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-primary",
        )}
      >
        <List size={16} />
        列表视图
      </button>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-surface-container-high pt-6">
      <div className="text-sm text-on-surface-variant">
        第 <span className="font-bold text-on-surface">{currentPage}</span> / {totalPages} 页
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
          上一页
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={cn(
              "h-10 w-10 rounded-xl text-sm font-bold transition-all",
              page === currentPage ? "bg-primary text-white shadow-sm" : "bg-surface-container-low text-on-surface-variant hover:text-primary",
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          下一页
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export const InventoryStatusPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [detail, setDetail] = useState<InventoryBatchDetail | null>(null);
  const [view, setView] = useState<InventoryView>("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(LIST_PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<InventoryRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newBatchError, setNewBatchError] = useState<string | null>(null);
  const [newBatchForm, setNewBatchForm] = useState<NewBatchFormState>(DEFAULT_NEW_BATCH_FORM);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const cardGridRef = useRef<HTMLDivElement | null>(null);
  const deferredQuery = useDeferredValue(newBatchForm.query);
  const productListParams = useMemo(() => ({ page: 1, size: 100 }), []);
  const batchListParams = useMemo(() => ({ page: 1, size: 100 }), []);
  const productsQuery = useQuery({
    queryKey: queryKeys.products.list(productListParams),
    queryFn: () => listProducts(productListParams),
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
  const batchesQuery = useQuery({
    queryKey: queryKeys.batches.list(batchListParams),
    queryFn: () => listBatches(batchListParams),
    staleTime: QUERY_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
  });
  const products = productsQuery.data?.items ?? [];
  const inventoryItems = useMemo(() => batchesQuery.data?.items.map(toInventoryRecord) ?? [], [batchesQuery.data]);
  const isLoading = productsQuery.isLoading || batchesQuery.isLoading;
  const pageError = productsQuery.error
    ? getErrorMessage(productsQuery.error)
    : batchesQuery.error
      ? getErrorMessage(batchesQuery.error)
      : null;

  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const enrichedItems = useMemo(
    () => inventoryItems.map((item) => mergeInventoryRecord(item, productMap.get(item.productId))),
    [inventoryItems, productMap],
  );
  const sortedItems = useMemo(() => sortInventoryItems(enrichedItems), [enrichedItems]);
  const selectedMetrics = useMemo(() => (selectedItem ? getShelfLifeMetrics(selectedItem) : null), [selectedItem]);
  const batchSearchResults = useMemo(() => {
    if (!isCreateBatchOpen) {
      return [];
    }

    const query = deferredQuery.trim().toLowerCase();
    if (!query) {
      return products;
    }
    const exactBarcode = products.find((product) => product.barcode.toLowerCase() === query);
    if (exactBarcode) {
      return [exactBarcode];
    }
    return products
      .filter((product) => {
        return (
          product.product_name.toLowerCase().includes(query) ||
          product.manufacturer.toLowerCase().includes(query) ||
          product.barcode.toLowerCase().includes(query)
        );
      });
  }, [deferredQuery, isCreateBatchOpen, products]);

  const pageSize = view === "card" ? cardPageSize : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  const reloadPageData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.products.lists() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.batches.lists() }),
    ]);
  };

  const openDetail = async (item: InventoryRecord) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetail(null);

    try {
      const product = productMap.get(item.productId) ?? null;
      const relatedBatchParams = { page: 1, size: 100 };
      const relatedBatches = await queryClient.fetchQuery({
        queryKey: queryKeys.batches.byProduct(item.productId, relatedBatchParams),
        queryFn: () => listProductBatches(item.productId, relatedBatchParams),
        staleTime: 5 * 60 * 1000,
      });
      setDetail(buildInventoryDetail(product, relatedBatches.items));
    } catch {
      setDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  const openCreateBatchModal = () => {
    setIsCreateBatchOpen(true);
    setSelectedProduct(null);
    setNewBatchError(null);
    setNewBatchForm(DEFAULT_NEW_BATCH_FORM);
  };

  const closeCreateBatchModal = () => {
    if (isSubmitting) {
      return;
    }
    setIsCreateBatchOpen(false);
    setSelectedProduct(null);
    setNewBatchError(null);
    setNewBatchForm(DEFAULT_NEW_BATCH_FORM);
  };

  const handleNewBatchChange = (field: keyof NewBatchFormState, value: string) => {
    setNewBatchForm((currentForm) => ({ ...currentForm, [field]: value }));
    setNewBatchError(null);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setNewBatchError(null);
    setNewBatchForm((currentForm) => ({
      ...currentForm,
      query: product.barcode || product.product_name,
    }));
  };

  const handleCreateBatch = async () => {
    if (!selectedProduct) {
      setNewBatchError("请先选择一个货物。");
      return;
    }
    if (!newBatchForm.quantity.trim() || Number.parseFloat(newBatchForm.quantity) <= 0) {
      setNewBatchError("请输入有效数量。");
      return;
    }
    if (!newBatchForm.manufactureDate) {
      setNewBatchError("请选择生产日期。");
      return;
    }

    setIsSubmitting(true);
    setNewBatchError(null);

    try {
      await createBatch({
        product_id: selectedProduct.id,
        quantity: newBatchForm.quantity.trim(),
        manufacture_date: newBatchForm.manufactureDate,
        remarks: newBatchForm.remarks.trim() || null,
      });
      await reloadPageData();
      await queryClient.invalidateQueries({ queryKey: queryKeys.batches.product(selectedProduct.id) });
      setIsCreateBatchOpen(false);
      setSelectedProduct(null);
      setNewBatchForm(DEFAULT_NEW_BATCH_FORM);
    } catch (error) {
      setNewBatchError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isDetailOpen) {
      const timer = window.setTimeout(() => {
        setSelectedItem(null);
        setDetail(null);
      }, 220);
      return () => window.clearTimeout(timer);
    }
  }, [isDetailOpen]);

  useEffect(() => {
    if (view !== "card") {
      return;
    }

    const container = cardGridRef.current;
    if (!container) {
      return;
    }

    const updatePageSize = () => {
      const nextPageSize = getCardPageSize(container.clientWidth);
      setCardPageSize((previousPageSize) => (previousPageSize === nextPageSize ? previousPageSize : nextPageSize));
    };

    updatePageSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updatePageSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [view]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">库存状态</h2>
          <p className="mt-1 text-on-surface-variant">批次列表、新建批次与详情弹窗已切到 Django `batches` 接口。</p>
        </div>
        <button
          type="button"
          onClick={openCreateBatchModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={18} />
          新建批次
        </button>
      </div>

      {pageError ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{pageError}</div>
      ) : null}

      <InventoryOverviewCards items={enrichedItems} />

      <section className="ambient-shadow overflow-hidden rounded-3xl border border-surface-container/10 bg-surface-container-lowest">
        <div className="flex flex-col gap-4 border-b border-surface-container-high p-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">批次详情</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {isLoading ? "正在从后端加载批次..." : `当前共 ${sortedItems.length} 个批次条目，临期与过期批次优先展示。`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:flex">
              {isLoading ? <LoaderCircle size={16} className="animate-spin" /> : <LayoutDashboard size={16} />}
              接口来源：`/api/batches`
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 px-8 py-20 text-center">
              <LoaderCircle size={28} className="animate-spin text-on-surface-variant" />
              <div>
                <h4 className="text-lg font-bold text-on-surface">正在同步批次数据</h4>
                <p className="mt-1 text-sm text-on-surface-variant">请确认 Django 服务已启动，并且 `VITE_API_BASE_URL` 指向正确后端。</p>
              </div>
            </div>
          ) : view === "card" ? (
            <InventoryCardView items={pagedItems} gridRef={cardGridRef} onOpenDetail={openDetail} />
          ) : (
            <InventoryListView items={pagedItems} onOpenDetail={openDetail} />
          )}
        </div>

        {!isLoading ? (
          <div className="px-8 pb-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        ) : null}
      </section>

      <InventoryBatchDetailModal
        open={isDetailOpen && !isDetailLoading && Boolean(detail)}
        item={selectedItem}
        detail={detail}
        metrics={selectedMetrics}
        onClose={closeDetail}
        formatDate={formatDate}
        formatQuantity={formatQuantity}
      />

      {isDetailOpen && isDetailLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-lg">
            <div className="flex items-center gap-3">
              <LoaderCircle size={18} className="animate-spin" />
              正在加载批次详情...
            </div>
          </div>
        </div>
      ) : null}

      <NewBatchModal
        open={isCreateBatchOpen}
        form={newBatchForm}
        submitting={isSubmitting}
        selectedProduct={selectedProduct}
        searchResults={batchSearchResults}
        error={newBatchError}
        onChange={handleNewBatchChange}
        onSelectProduct={handleSelectProduct}
        onClose={closeCreateBatchModal}
        onSubmit={handleCreateBatch}
      />

      <FloatingActionButtons />
    </>
  );
};
