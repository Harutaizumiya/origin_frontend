import React, { useState } from "react";
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  DashboardOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  BarsOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight, Package, ShieldCheck, TriangleAlert, Warehouse } from "lucide-react";
import { cn } from "../../lib/utils";
import { StatCard } from "../dashboard/StatCard";

type InventoryView = "card" | "list";
type InventoryHealth = "healthy" | "warning" | "critical";

interface InventoryRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  warehouse: string;
  available: number;
  reserved: number;
  threshold: number;
  turnoverDays: number;
  updatedAt: string;
  health: InventoryHealth;
}

const INVENTORY_ITEMS: InventoryRecord[] = [
  {
    id: "INV-001",
    sku: "FO-MT-1024",
    name: "澳洲安格斯牛肉 300g",
    category: "肉类",
    warehouse: "冷库 A-04",
    available: 42,
    reserved: 8,
    threshold: 60,
    turnoverDays: 2,
    updatedAt: "今天 14:20",
    health: "critical",
  },
  {
    id: "INV-002",
    sku: "FO-DY-2381",
    name: "全脂巴氏杀菌奶 1L",
    category: "乳制品",
    warehouse: "冷库 B-12",
    available: 156,
    reserved: 24,
    threshold: 120,
    turnoverDays: 5,
    updatedAt: "今天 14:16",
    health: "healthy",
  },
  {
    id: "INV-003",
    sku: "FO-BK-5402",
    name: "法式牛角包 6件装",
    category: "烘焙",
    warehouse: "常温 D-01",
    available: 85,
    reserved: 12,
    threshold: 90,
    turnoverDays: 3,
    updatedAt: "今天 13:52",
    health: "warning",
  },
  {
    id: "INV-004",
    sku: "FO-DR-4508",
    name: "冷藏橙汁 500ml",
    category: "饮品",
    warehouse: "冷库 B-05",
    available: 210,
    reserved: 18,
    threshold: 140,
    turnoverDays: 6,
    updatedAt: "今天 13:45",
    health: "healthy",
  },
  {
    id: "INV-005",
    sku: "FO-VG-6120",
    name: "有机小菠菜 200g",
    category: "蔬菜",
    warehouse: "冷库 C-02",
    available: 34,
    reserved: 10,
    threshold: 50,
    turnoverDays: 1,
    updatedAt: "今天 13:18",
    health: "critical",
  },
  {
    id: "INV-006",
    sku: "FO-FR-3301",
    name: "蓝莓鲜果盒 125g",
    category: "水果",
    warehouse: "冷库 C-05",
    available: 78,
    reserved: 15,
    threshold: 70,
    turnoverDays: 4,
    updatedAt: "今天 12:46",
    health: "healthy",
  },
  {
    id: "INV-007",
    sku: "FO-FZ-7711",
    name: "冷冻薯角 1kg",
    category: "冷冻食品",
    warehouse: "冻库 F-08",
    available: 121,
    reserved: 22,
    threshold: 100,
    turnoverDays: 8,
    updatedAt: "今天 11:58",
    health: "healthy",
  },
  {
    id: "INV-008",
    sku: "FO-SN-2048",
    name: "坚果能量棒 12支装",
    category: "零食",
    warehouse: "常温 E-03",
    available: 64,
    reserved: 20,
    threshold: 80,
    turnoverDays: 7,
    updatedAt: "今天 11:40",
    health: "warning",
  },
  {
    id: "INV-009",
    sku: "FO-SF-9052",
    name: "烟熏三文鱼 150g",
    category: "海鲜",
    warehouse: "冷库 A-09",
    available: 28,
    reserved: 9,
    threshold: 40,
    turnoverDays: 2,
    updatedAt: "今天 11:12",
    health: "critical",
  },
];

const PAGE_SIZE = 6;

function getHealthMeta(health: InventoryHealth) {
  if (health === "critical") {
    return {
      label: "已过期",
      hint: "请及时处理",
      tagClassName: "bg-red-50 text-red-500 border-red-200",
      lineClassName: "bg-red-500",
      icon: <ExclamationCircleFilled className="text-red-500" />,
      progress: "bg-red-500",
    };
  }

  if (health === "warning") {
    return {
      label: "临期",
      hint: "请注意效期",
      tagClassName: "bg-orange-50 text-orange-500 border-orange-200",
      lineClassName: "bg-orange-400",
      icon: <ClockCircleFilled className="text-orange-500" />,
      progress: "bg-orange-400",
    };
  }

  return {
    label: "健康",
    hint: "库存状态稳定",
    tagClassName: "bg-blue-50 text-blue-500 border-blue-200",
    lineClassName: "bg-sky-500",
    icon: <CheckCircleFilled className="text-sky-500" />,
    progress: "bg-sky-500",
  };
}

function getCoveragePercent(item: InventoryRecord) {
  return Math.min(100, Math.round((item.available / item.threshold) * 100));
}

function InventoryOverviewCards() {
  const totalAvailable = INVENTORY_ITEMS.reduce((sum, item) => sum + item.available, 0);
  const lowStockCount = INVENTORY_ITEMS.filter((item) => item.health !== "healthy").length;
  const warehouseCount = new Set(INVENTORY_ITEMS.map((item) => item.warehouse)).size;
  const healthyRate = Math.round(
    (INVENTORY_ITEMS.filter((item) => item.health === "healthy").length / INVENTORY_ITEMS.length) * 100,
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="库存总量"
        value={totalAvailable.toLocaleString()}
        trend="+4.2%"
        trendType="up"
        icon={<Package size={24} />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        title="低库存商品"
        value={String(lowStockCount)}
        trend="需关注"
        trendType="neutral"
        icon={<TriangleAlert size={24} />}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-600"
      />
      <StatCard
        title="仓储点位"
        value={String(warehouseCount)}
        trend="稳定"
        trendType="up"
        icon={<Warehouse size={24} />}
        iconBg="bg-sky-500/10"
        iconColor="text-sky-600"
      />
      <StatCard
        title="库存健康率"
        value={`${healthyRate}%`}
        trend="本周提升"
        trendType="up"
        icon={<ShieldCheck size={24} />}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />
    </div>
  );
}

function InventoryCardView({ items }: { items: InventoryRecord[] }) {
  return (
    <div
      className="grid gap-5"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" }}
    >
      {items.map((item) => {
        const meta = getHealthMeta(item.health);
        const coveragePercent = getCoveragePercent(item);

        return (
          <article
            key={item.id}
            className="group relative flex aspect-square min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white px-4 pt-4 pb-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
          >
            <div className={cn("absolute inset-x-0 bottom-0 h-1.5", meta.lineClassName)} />

            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span>#{item.id.replace("INV-", "")}</span>
                  <span className="text-slate-300">|</span>
                  <span className="truncate">{item.sku}</span>
                </div>
                <h3 className="line-clamp-2 text-[18px] font-semibold leading-6 text-slate-900">
                  {item.name}
                </h3>
              </div>

              <span
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                  meta.tagClassName,
                )}
              >
                {meta.icon}
                {meta.label}
              </span>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px]">{item.category}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px]">{item.warehouse}</span>
            </div>

            <div className="mb-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <div className="mb-2.5 flex items-center justify-between text-[13px] text-slate-500">
                <span>保质期</span>
                <span className="font-semibold text-slate-700">{coveragePercent}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-slate-200">
                <div
                  className={cn("h-2 rounded-full transition-all", meta.progress)}
                  style={{ width: `${coveragePercent}%` }}
                />
              </div>
                <div className="mt-2.5 flex justify-between gap-2 text-sm">
                <div>
                  <div className="text-[12px] text-slate-400">生产日期</div>
                  <div className="mt-0.5 text-[15px] font-semibold text-slate-900">{item.available}</div>
                </div>
                <div>
                  <div className="text-[12px] text-slate-400">到期时间</div>
                  <div className="mt-0.5 text-[15px] font-semibold text-slate-900">{item.threshold}</div>
                </div>
                </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3 text-sm text-slate-500">
              <div>
                <div className="mb-0.5 text-[12px] text-slate-400">剩余天数</div>
                <div className="font-semibold text-slate-900">{item.turnoverDays} 天</div>
              </div>
              <div className="text-right">
                <div className="mb-0.5 text-[12px] text-slate-400">最近更新</div>
                <div className="font-semibold text-slate-900">{item.updatedAt}</div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-slate-900">{meta.hint}</div>
                <div className="mt-0.5 text-[12px] text-slate-500">查看明细</div>
              </div>
              <button
                type="button"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition-all hover:bg-primary"
              >
                <ArrowRightOutlined />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InventoryListView({ items }: { items: InventoryRecord[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-surface-container-low/50">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              商品
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              仓位
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">
              可用库存
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">
              预留
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">
              安全阈值
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              状态
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              更新时间
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-low">
          {items.map((item) => {
            const meta = getHealthMeta(item.health);

            return (
              <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors">
                <td className="px-6 py-5">
                  <div className="font-bold text-on-surface">{item.name}</div>
                  <div className="text-xs text-on-surface-variant mt-1">
                    {item.sku} · {item.category}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{item.warehouse}</td>
                <td className="px-6 py-5 text-center font-bold text-on-surface">{item.available}</td>
                <td className="px-6 py-5 text-center text-on-surface">{item.reserved}</td>
                <td className="px-6 py-5 text-center text-on-surface">{item.threshold}</td>
                <td className="px-6 py-5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      meta.tagClassName,
                    )}
                  >
                    {meta.icon}
                    {meta.label}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-on-surface-variant">{item.updatedAt}</td>
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
        <AppstoreOutlined />
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
        <BarsOutlined />
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
              page === currentPage
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-low text-on-surface-variant hover:text-primary",
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
  const [view, setView] = useState<InventoryView>("card");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(INVENTORY_ITEMS.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedItems = INVENTORY_ITEMS.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-on-surface font-headline">
            库存状态
          </h2>
          <p className="mt-1 text-on-surface-variant">
            以运营视角查看库存健康度，快速识别低库存商品并追踪补货动作。
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <BarChartOutlined className="text-primary" />
          <div className="text-sm">
            <div className="font-bold text-on-surface">库存监控已同步</div>
            <div className="text-on-surface-variant">最近一次刷新：今天 14:32</div>
          </div>
        </div>
      </div>

      <InventoryOverviewCards />

      <section className="overflow-hidden rounded-3xl border border-surface-container/10 bg-surface-container-lowest ambient-shadow">
        <div className="flex flex-col gap-4 border-b border-surface-container-high p-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">库存详情</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              当前共 {INVENTORY_ITEMS.length} 个商品条目，支持卡片和列表两种浏览方式。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:flex">
              <DashboardOutlined />
              页面按当前展示区域自适应
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        <div className="p-8">
          {view === "card" ? <InventoryCardView items={pagedItems} /> : <InventoryListView items={pagedItems} />}
        </div>

        <div className="px-8 pb-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </section>
    </>
  );
};
