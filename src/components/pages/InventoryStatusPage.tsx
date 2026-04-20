import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BarsOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  DashboardOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight, Package, ShieldCheck, TriangleAlert, Warehouse } from "lucide-react";
import { cn } from "../../lib/utils";
import { FloatingActionButtons } from "../actions/FloatingActionButtons";
import { StatCard } from "../dashboard/StatCard";
import { InventoryBatchDetailModal } from "./InventoryBatchDetailModal";
import { InventoryStatusCard } from "./InventoryStatusCard";
import type {
  InventoryBatchDetail,
  InventoryHealth,
  InventoryHealthMeta,
  InventoryRecord,
  ShelfLifeMetrics,
} from "./InventoryStatus.types";

type InventoryView = "card" | "list";

const INVENTORY_ITEMS: InventoryRecord[] = [
  {
    id: "INV-001",
    quantity: "250.0",
    manufacturer: "澳洲进口商",
    productName: "澳洲安格斯牛肉 300g",
    category: "肉类",
    location: "冷库 A-04",
    manufactureDate: "2026-01-08",
    expireDate: "2027-01-08T00:00:00+00:00",
    receivedDate: "2026-01-08T21:46:04+00:00",
  },
  {
    id: "INV-002",
    quantity: "180.0",
    manufacturer: "新西兰乳品供应商",
    productName: "巴氏杀菌全脂牛奶 1L",
    category: "乳制品",
    location: "冷库 B-12",
    manufactureDate: "2026-02-18",
    expireDate: "2026-05-18T00:00:00+00:00",
    receivedDate: "2026-02-19T09:15:00+00:00",
  },
  {
    id: "INV-003",
    quantity: "96.0",
    manufacturer: "本地烘焙工坊",
    productName: "法式牛角包 6个装",
    category: "烘焙",
    location: "常温 D-01",
    manufactureDate: "2026-03-27",
    expireDate: "2026-04-02T00:00:00+00:00",
    receivedDate: "2026-03-27T06:30:00+00:00",
  },
  {
    id: "INV-004",
    quantity: "210.0",
    manufacturer: "华东饮品工厂",
    productName: "冷藏橙汁 500ml",
    category: "饮品",
    location: "冷库 B-05",
    manufactureDate: "2026-03-10",
    expireDate: "2026-04-20T00:00:00+00:00",
    receivedDate: "2026-03-11T08:12:00+00:00",
  },
  {
    id: "INV-005",
    quantity: "34.0",
    manufacturer: "有机蔬菜基地",
    productName: "有机小菠菜 200g",
    category: "蔬菜",
    location: "冷库 C-02",
    manufactureDate: "2026-03-29",
    expireDate: "2026-04-01T00:00:00+00:00",
    receivedDate: "2026-03-29T05:25:00+00:00",
  },
  {
    id: "INV-006",
    quantity: "78.0",
    manufacturer: "云南水果合作社",
    productName: "蓝莓鲜果盒 125g",
    category: "水果",
    location: "冷库 C-05",
    manufactureDate: "2026-03-20",
    expireDate: "2026-04-05T00:00:00+00:00",
    receivedDate: "2026-03-21T07:45:00+00:00",
  },
  {
    id: "INV-007",
    quantity: "121.0",
    manufacturer: "华北冷冻食品厂",
    productName: "冷冻虾仁 1kg",
    category: "冷冻食品",
    location: "冻库 F-08",
    manufactureDate: "2025-12-12",
    expireDate: "2026-12-12T00:00:00+00:00",
    receivedDate: "2025-12-15T10:20:00+00:00",
  },
  {
    id: "INV-008",
    quantity: "64.0",
    manufacturer: "健康零食品牌商",
    productName: "坚果能量棒 12支装",
    category: "零食",
    location: "常温 E-03",
    manufactureDate: "2025-11-01",
    expireDate: "2026-05-01T00:00:00+00:00",
    receivedDate: "2025-11-05T03:10:00+00:00",
  },
  {
    id: "INV-009",
    quantity: "28.0",
    manufacturer: "北欧海鲜进口商",
    productName: "烟熏三文鱼 150g",
    category: "海鲜",
    location: "冷库 A-09",
    manufactureDate: "2026-03-01",
    expireDate: "2026-03-28T00:00:00+00:00",
    receivedDate: "2026-03-02T12:00:00+00:00",
  },
];

const INVENTORY_DETAIL_MAP: Record<string, InventoryBatchDetail> = {
  "INV-001": {
    sku: "FO-MT-300-AU",
    currentStock: 250,
    averageLossRate: "1.8",
    batchCount: 6,
    primaryBatchId: "#BT-99281",
    storageRequirements: [
      { label: "目标温度", value: "-18°C", subValue: "稳定", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "68%", subValue: "正常", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99281", quantity: 250, manufactureDate: "2026-01-08", expireDate: "2027-01-08T00:00:00+00:00", progress: 78, remainingDays: 284, health: "healthy" },
      { id: "#BT-99302", quantity: 190, manufactureDate: "2026-01-15", expireDate: "2027-01-15T00:00:00+00:00", progress: 80, remainingDays: 291, health: "healthy" },
      { id: "#BT-99320", quantity: 96, manufactureDate: "2026-02-01", expireDate: "2027-02-01T00:00:00+00:00", progress: 84, remainingDays: 308, health: "healthy" },
    ],
  },
  "INV-002": {
    sku: "FO-DY-001-NZ",
    currentStock: 180,
    averageLossRate: "2.4",
    batchCount: 8,
    primaryBatchId: "#BT-99304",
    storageRequirements: [
      { label: "目标温度", value: "4°C", subValue: "±1°C", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "75%", subValue: "稳定", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99304", quantity: 180, manufactureDate: "2026-02-18", expireDate: "2026-05-18T00:00:00+00:00", progress: 42, remainingDays: 49, health: "warning" },
      { id: "#BT-99318", quantity: 144, manufactureDate: "2026-02-24", expireDate: "2026-05-24T00:00:00+00:00", progress: 49, remainingDays: 55, health: "warning" },
      { id: "#BT-99328", quantity: 132, manufactureDate: "2026-03-01", expireDate: "2026-05-30T00:00:00+00:00", progress: 55, remainingDays: 61, health: "healthy" },
    ],
  },
  "INV-003": {
    sku: "FO-BK-006-LC",
    currentStock: 96,
    averageLossRate: "4.1",
    batchCount: 5,
    primaryBatchId: "#BT-99333",
    storageRequirements: [
      { label: "目标温度", value: "22°C", subValue: "常温", icon: "temperature", colorClassName: "bg-amber-50 text-amber-600" },
      { label: "目标湿度", value: "45%", subValue: "干燥", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99333", quantity: 96, manufactureDate: "2026-03-27", expireDate: "2026-04-02T00:00:00+00:00", progress: 17, remainingDays: 3, health: "critical" },
      { id: "#BT-99334", quantity: 88, manufactureDate: "2026-03-28", expireDate: "2026-04-03T00:00:00+00:00", progress: 30, remainingDays: 4, health: "warning" },
      { id: "#BT-99336", quantity: 72, manufactureDate: "2026-03-29", expireDate: "2026-04-04T00:00:00+00:00", progress: 42, remainingDays: 5, health: "warning" },
    ],
  },
  "INV-004": {
    sku: "FO-DR-500-CN",
    currentStock: 210,
    averageLossRate: "1.2",
    batchCount: 7,
    primaryBatchId: "#BT-99345",
    storageRequirements: [
      { label: "目标温度", value: "6°C", subValue: "冷藏", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "70%", subValue: "稳定", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99345", quantity: 210, manufactureDate: "2026-03-10", expireDate: "2026-04-20T00:00:00+00:00", progress: 48, remainingDays: 21, health: "warning" },
      { id: "#BT-99346", quantity: 180, manufactureDate: "2026-03-11", expireDate: "2026-04-21T00:00:00+00:00", progress: 50, remainingDays: 22, health: "warning" },
      { id: "#BT-99347", quantity: 174, manufactureDate: "2026-03-12", expireDate: "2026-04-22T00:00:00+00:00", progress: 53, remainingDays: 23, health: "healthy" },
    ],
  },
  "INV-005": {
    sku: "FO-VG-200-OG",
    currentStock: 34,
    averageLossRate: "6.5",
    batchCount: 4,
    primaryBatchId: "#BT-99351",
    storageRequirements: [
      { label: "目标温度", value: "2°C", subValue: "冷藏", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "85%", subValue: "高湿", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99351", quantity: 34, manufactureDate: "2026-03-29", expireDate: "2026-04-01T00:00:00+00:00", progress: 4, remainingDays: 1, health: "critical" },
      { id: "#BT-99352", quantity: 30, manufactureDate: "2026-03-29", expireDate: "2026-04-02T00:00:00+00:00", progress: 22, remainingDays: 2, health: "warning" },
      { id: "#BT-99353", quantity: 28, manufactureDate: "2026-03-30", expireDate: "2026-04-03T00:00:00+00:00", progress: 33, remainingDays: 3, health: "warning" },
    ],
  },
  "INV-006": {
    sku: "FO-FR-125-YN",
    currentStock: 78,
    averageLossRate: "3.6",
    batchCount: 5,
    primaryBatchId: "#BT-99360",
    storageRequirements: [
      { label: "目标温度", value: "3°C", subValue: "冷藏", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "78%", subValue: "稳定", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99360", quantity: 78, manufactureDate: "2026-03-20", expireDate: "2026-04-05T00:00:00+00:00", progress: 34, remainingDays: 6, health: "warning" },
      { id: "#BT-99361", quantity: 66, manufactureDate: "2026-03-21", expireDate: "2026-04-06T00:00:00+00:00", progress: 40, remainingDays: 7, health: "warning" },
      { id: "#BT-99362", quantity: 52, manufactureDate: "2026-03-22", expireDate: "2026-04-07T00:00:00+00:00", progress: 46, remainingDays: 8, health: "warning" },
    ],
  },
  "INV-007": {
    sku: "FO-FZ-1000-HB",
    currentStock: 121,
    averageLossRate: "1.1",
    batchCount: 6,
    primaryBatchId: "#BT-99371",
    storageRequirements: [
      { label: "目标温度", value: "-20°C", subValue: "冷冻", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "65%", subValue: "稳定", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99371", quantity: 121, manufactureDate: "2025-12-12", expireDate: "2026-12-12T00:00:00+00:00", progress: 71, remainingDays: 257, health: "healthy" },
      { id: "#BT-99372", quantity: 110, manufactureDate: "2025-12-20", expireDate: "2026-12-20T00:00:00+00:00", progress: 73, remainingDays: 265, health: "healthy" },
      { id: "#BT-99373", quantity: 102, manufactureDate: "2025-12-30", expireDate: "2026-12-30T00:00:00+00:00", progress: 75, remainingDays: 275, health: "healthy" },
    ],
  },
  "INV-008": {
    sku: "FO-SN-012-HL",
    currentStock: 64,
    averageLossRate: "2.1",
    batchCount: 9,
    primaryBatchId: "#BT-99382",
    storageRequirements: [
      { label: "目标温度", value: "20°C", subValue: "常温", icon: "temperature", colorClassName: "bg-amber-50 text-amber-600" },
      { label: "目标湿度", value: "50%", subValue: "干燥", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99382", quantity: 64, manufactureDate: "2025-11-01", expireDate: "2026-05-01T00:00:00+00:00", progress: 18, remainingDays: 32, health: "critical" },
      { id: "#BT-99383", quantity: 58, manufactureDate: "2025-11-12", expireDate: "2026-05-12T00:00:00+00:00", progress: 24, remainingDays: 43, health: "warning" },
      { id: "#BT-99384", quantity: 76, manufactureDate: "2025-11-18", expireDate: "2026-05-18T00:00:00+00:00", progress: 28, remainingDays: 49, health: "warning" },
    ],
  },
  "INV-009": {
    sku: "FO-SF-150-NO",
    currentStock: 28,
    averageLossRate: "7.9",
    batchCount: 3,
    primaryBatchId: "#BT-99391",
    storageRequirements: [
      { label: "目标温度", value: "1°C", subValue: "冰鲜", icon: "temperature", colorClassName: "bg-blue-50 text-blue-600" },
      { label: "目标湿度", value: "82%", subValue: "高湿", icon: "humidity", colorClassName: "bg-cyan-50 text-cyan-600" },
    ],
    relatedBatches: [
      { id: "#BT-99391", quantity: 28, manufactureDate: "2026-03-01", expireDate: "2026-03-28T00:00:00+00:00", progress: 0, remainingDays: 0, health: "critical" },
      { id: "#BT-99392", quantity: 22, manufactureDate: "2026-03-02", expireDate: "2026-03-29T00:00:00+00:00", progress: 0, remainingDays: 0, health: "critical" },
      { id: "#BT-99393", quantity: 18, manufactureDate: "2026-03-03", expireDate: "2026-03-30T00:00:00+00:00", progress: 0, remainingDays: 0, health: "critical" },
    ],
  },
};

const LIST_PAGE_SIZE = 6;
const CARD_MIN_WIDTH = 280;
const CARD_MAX_WIDTH = 360;
const CARD_GRID_GAP = 16;
const CARD_ROWS_PER_PAGE = 2;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HEALTH_PRIORITY: Record<InventoryHealth, number> = {
  critical: 0,
  warning: 1,
  healthy: 2,
};

function parseQuantity(quantity: string) {
  return Number.parseFloat(quantity) || 0;
}

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
  const now = new Date();
  const manufactureDate = new Date(item.manufactureDate);
  const expireDate = new Date(item.expireDate);
  const totalDuration = expireDate.getTime() - manufactureDate.getTime();
  const remainingDuration = expireDate.getTime() - now.getTime();
  const rawPercent = totalDuration > 0 ? (remainingDuration / totalDuration) * 100 : 0;
  const percent = Math.max(0, Math.min(100, Math.round(rawPercent)));
  const remainingDays = Math.max(0, Math.ceil(remainingDuration / DAY_IN_MS));

  if (remainingDuration <= 0 || percent < 20) {
    return { percent, remainingDays, health: "critical" };
  }

  if (percent <= 50) {
    return { percent, remainingDays, health: "warning" };
  }

  return { percent, remainingDays, health: "healthy" };
}

function getHealthMeta(health: InventoryHealth): InventoryHealthMeta {
  if (health === "critical") {
    return {
      label: "高风险",
      hint: "建议优先处理该批次",
      tagClassName: "bg-red-50 text-red-500 border-red-200",
      lineClassName: "bg-red-500",
      icon: <ExclamationCircleFilled className="text-red-500" />,
      progress: "bg-red-500",
    };
  }

  if (health === "warning") {
    return {
      label: "临期预警",
      hint: "请关注剩余效期",
      tagClassName: "bg-orange-50 text-orange-500 border-orange-200",
      lineClassName: "bg-orange-400",
      icon: <ClockCircleFilled className="text-orange-500" />,
      progress: "bg-orange-400",
    };
  }

  return {
    label: "效期健康",
    hint: "批次效期处于安全区间",
    tagClassName: "bg-blue-50 text-blue-500 border-blue-200",
    lineClassName: "bg-sky-500",
    icon: <CheckCircleFilled className="text-sky-500" />,
    progress: "bg-sky-500",
  };
}

function sortInventoryItems(items: InventoryRecord[]) {
  return [...items].sort((left, right) => {
    const leftMetrics = getShelfLifeMetrics(left);
    const rightMetrics = getShelfLifeMetrics(right);
    const healthDiff = HEALTH_PRIORITY[leftMetrics.health] - HEALTH_PRIORITY[rightMetrics.health];

    if (healthDiff !== 0) {
      return healthDiff;
    }

    const expireDiff = new Date(left.expireDate).getTime() - new Date(right.expireDate).getTime();
    if (expireDiff !== 0) {
      return expireDiff;
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

function InventoryOverviewCards() {
  const itemMetrics = INVENTORY_ITEMS.map((item) => getShelfLifeMetrics(item));
  const totalQuantity = INVENTORY_ITEMS.reduce((sum, item) => sum + parseQuantity(item.quantity), 0);
  const riskBatchCount = itemMetrics.filter((metric) => metric.health !== "healthy").length;
  const locationCount = new Set(INVENTORY_ITEMS.map((item) => item.location)).size;
  const healthyRate = Math.round(
    (itemMetrics.filter((metric) => metric.health === "healthy").length / INVENTORY_ITEMS.length) * 100,
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
        title="临期/异常批次"
        value={String(riskBatchCount)}
        trend="需优先关注"
        trendType="neutral"
        icon={<TriangleAlert size={24} />}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-600"
      />
      <StatCard
        title="库位数量"
        value={String(locationCount)}
        trend="按位置去重"
        trendType="up"
        icon={<Warehouse size={24} />}
        iconBg="bg-sky-500/10"
        iconColor="text-sky-600"
      />
      <StatCard
        title="健康批次占比"
        value={`${healthyRate}%`}
        trend="基于剩余效期"
        trendType="up"
        icon={<ShieldCheck size={24} />}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />
    </div>
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
                    <span
                      className={cn(
                        "inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                        meta.tagClassName,
                      )}
                    >
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
  const [cardPageSize, setCardPageSize] = useState(LIST_PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<InventoryRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const cardGridRef = useRef<HTMLDivElement | null>(null);
  const sortedItems = useMemo(() => sortInventoryItems(INVENTORY_ITEMS), []);

  const selectedMetrics = useMemo(
    () => (selectedItem ? getShelfLifeMetrics(selectedItem) : null),
    [selectedItem],
  );
  const selectedDetail = useMemo(
    () => (selectedItem ? INVENTORY_DETAIL_MAP[selectedItem.id] ?? null : null),
    [selectedItem],
  );

  const pageSize = view === "card" ? cardPageSize : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  const openDetail = (item: InventoryRecord) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
  };

  useEffect(() => {
    if (!isDetailOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDetailOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDetailOpen]);

  useEffect(() => {
    if (!isDetailOpen) {
      const timer = window.setTimeout(() => {
        setSelectedItem(null);
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
          <p className="mt-1 text-on-surface-variant">
            以批次与效期视角查看库存状态，快速识别临期商品并追踪各库位批次健康度。
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
          <BarChartOutlined className="text-primary" />
          <div className="text-sm">
            <div className="font-bold text-on-surface">效期监控已同步</div>
            <div className="text-on-surface-variant">卡片与列表均按临期优先顺序展示</div>
          </div>
        </div>
      </div>

      <InventoryOverviewCards />

      <section className="ambient-shadow overflow-hidden rounded-3xl border border-surface-container/10 bg-surface-container-lowest">
        <div className="flex flex-col gap-4 border-b border-surface-container-high p-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">批次详情</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              当前共 {sortedItems.length} 个批次条目，临期与已过期批次会优先展示在最前面。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:flex">
              <DashboardOutlined />
              支持卡片与列表两种视图，并可打开同一份批次详情
            </div>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        <div className="p-8">
          {view === "card" ? (
            <InventoryCardView items={pagedItems} gridRef={cardGridRef} onOpenDetail={openDetail} />
          ) : (
            <InventoryListView items={pagedItems} onOpenDetail={openDetail} />
          )}
        </div>

        <div className="px-8 pb-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </section>

      <InventoryBatchDetailModal
        open={isDetailOpen}
        item={selectedItem}
        detail={selectedDetail}
        metrics={selectedMetrics}
        onClose={closeDetail}
        formatDate={formatDate}
        formatQuantity={formatQuantity}
      />

      <FloatingActionButtons />
    </>
  );
};
