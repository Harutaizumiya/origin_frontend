import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AppstoreOutlined,
  BarsOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  DashboardOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight, Package, Plus, Search, ShieldCheck, TriangleAlert, Warehouse, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { FloatingActionButtons } from "../actions/FloatingActionButtons";
import { StatCard } from "../dashboard/StatCard";
import { InventoryBatchDetailModal } from "./InventoryBatchDetailModal";
import { InventoryStatusCard } from "./InventoryStatusCard";
import { INITIAL_PRODUCTS } from "./ProductManagement.mock";
import type { Product } from "./ProductManagement.types";
import type {
  InventoryBatchDetail,
  InventoryHealth,
  InventoryHealthMeta,
  InventoryRecord,
  ShelfLifeMetrics,
} from "./InventoryStatus.types";

type InventoryView = "card" | "list";

interface NewBatchFormState {
  query: string;
  quantity: string;
  manufactureDate: string;
}

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
const DEFAULT_NEW_BATCH_FORM: NewBatchFormState = {
  query: "",
  quantity: "",
  manufactureDate: "",
};
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

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getExpireDateFromManufacture(manufactureDate: string, shelfLifeDays: number) {
  const expireDate = new Date(`${manufactureDate}T12:00:00`);
  expireDate.setDate(expireDate.getDate() + shelfLifeDays);
  return expireDate.toISOString();
}

function getNextInventoryId(items: InventoryRecord[]) {
  const highestId = items.reduce((highest, item) => {
    const numericId = Number.parseInt(item.id.replace("INV-", ""), 10);
    return Number.isNaN(numericId) ? highest : Math.max(highest, numericId);
  }, 0);

  return `INV-${String(highestId + 1).padStart(3, "0")}`;
}

function getTemperatureMeta(location: string | null) {
  if (location?.includes("冻")) {
    return { value: "-18°C", subValue: "冷冻", colorClassName: "bg-blue-50 text-blue-600" };
  }

  if (location?.includes("冷")) {
    return { value: "4°C", subValue: "冷藏", colorClassName: "bg-blue-50 text-blue-600" };
  }

  return { value: "22°C", subValue: "常温", colorClassName: "bg-amber-50 text-amber-600" };
}

function getCardPageSize(containerWidth: number) {
  if (containerWidth <= 0) {
    return LIST_PAGE_SIZE;
  }

  const columnCount = Math.max(1, Math.floor((containerWidth + CARD_GRID_GAP) / (CARD_MIN_WIDTH + CARD_GRID_GAP)));
  return columnCount * CARD_ROWS_PER_PAGE;
}

function InventoryOverviewCards({ items }: { items: InventoryRecord[] }) {
  const itemMetrics = items.map((item) => getShelfLifeMetrics(item));
  const totalQuantity = items.reduce((sum, item) => sum + parseQuantity(item.quantity), 0);
  const riskBatchCount = itemMetrics.filter((metric) => metric.health !== "healthy").length;
  const locationCount = new Set(items.map((item) => item.location)).size;
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

function NewBatchModal({
  open,
  form,
  selectedProduct,
  searchResults,
  expireDate,
  error,
  onChange,
  onSelectProduct,
  onClose,
  onSubmit,
}: {
  open: boolean;
  form: NewBatchFormState;
  selectedProduct: Product | null;
  searchResults: Product[];
  expireDate: string | null;
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
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.section
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="ambient-shadow pointer-events-auto relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-surface-container/10 bg-surface-container-lowest"
            >
              <div className="flex items-start justify-between border-b border-surface-container-high p-8 md:p-10">
                <div>
                  <h3 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">新建批次</h3>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    先扫描条码或搜索货物，再填写数量和生产日期。无码货物可直接按名称或厂商查询。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:text-primary"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid flex-1 gap-6 overflow-y-auto p-8 md:p-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-start">
                <section className="rounded-3xl border border-slate-200 bg-slate-50/80 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Search size={18} />
                    </div>
                    <div>
                      <h4 className="font-headline text-lg font-bold text-on-surface">识别货物</h4>
                      <p className="mt-1 text-xs text-on-surface-variant">支持扫码枪输入条码，也支持手动搜索货物名称、条码或厂商。</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="relative block">
                      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                      <input
                        autoFocus
                        value={form.query}
                        onChange={(event) => onChange("query", event.target.value)}
                        placeholder="扫描条码或输入货物名称 / 条码 / 厂商"
                        className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15"
                      />
                    </label>
                  </div>

                  {selectedProduct ? (
                    <div className="mt-5 rounded-3xl border border-primary/10 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">已选货物</div>
                          <h5 className="mt-2 font-headline text-2xl font-extrabold text-on-surface">{selectedProduct.product_name}</h5>
                          <div className="mt-2 text-sm text-on-surface-variant">
                            条码：{selectedProduct.barcode || "未填写"} · 厂商：{selectedProduct.manufacturer}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm md:min-w-[260px]">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">分类</div>
                            <div className="mt-1 font-semibold text-on-surface">{selectedProduct.category || "未填写"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">单位</div>
                            <div className="mt-1 font-semibold text-on-surface">{selectedProduct.unit || "未填写"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">默认库位</div>
                            <div className="mt-1 font-semibold text-on-surface">{selectedProduct.location || "未填写"}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">保质期</div>
                            <div className="mt-1 font-semibold text-on-surface">{selectedProduct.shelf_life_days} 天</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-5 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant">查询结果</div>
                    {searchResults.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {searchResults.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => onSelectProduct(product)}
                            className={cn(
                              "rounded-2xl border px-4 py-4 text-left transition-all",
                              selectedProduct?.id === product.id
                                ? "border-primary/30 bg-primary/5 shadow-[0_10px_24px_rgba(37,99,235,0.08)]"
                                : "border-slate-200 bg-white hover:border-primary/20 hover:bg-slate-50",
                            )}
                          >
                            <div className="font-semibold text-on-surface">{product.product_name}</div>
                            <div className="mt-1 text-xs text-on-surface-variant">
                              条码：{product.barcode || "未填写"} · 厂商：{product.manufacturer}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-sm text-on-surface-variant">
                        未找到匹配货物，请继续输入关键词或前往货物管理页先维护货物主数据。
                      </div>
                    )}
                  </div>
                </section>

                <section className={cn("rounded-3xl border p-6 transition-all xl:sticky xl:top-0", selectedProduct ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50/70 opacity-70")}>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-headline text-lg font-bold text-on-surface">批次信息</h4>
                      <p className="mt-1 text-xs text-on-surface-variant">选中货物后填写数量和生产日期，到期日期会自动推导。</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">预计到期</div>
                      <div className="mt-1 text-sm font-bold text-on-surface">{expireDate ? formatDate(expireDate) : "待选择生产日期"}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface">数量 *</span>
                      <input
                        type="number"
                        min={0}
                        step="0.1"
                        disabled={!selectedProduct}
                        value={form.quantity}
                        onChange={(event) => onChange("quantity", event.target.value)}
                        placeholder="输入本次入库数量"
                        className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-on-surface">生产日期 *</span>
                      <input
                        type="date"
                        disabled={!selectedProduct}
                        value={form.manufactureDate}
                        onChange={(event) => onChange("manufactureDate", event.target.value)}
                        className="w-full rounded-2xl border border-slate-200 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
                      />
                    </label>
                  </div>

                  {error ? <div className="mt-4 text-sm font-semibold text-red-500">{error}</div> : null}
                </section>
              </div>

              <div className="flex flex-col gap-3 border-t border-surface-container-high bg-white/90 p-8 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
                >
                  <Plus size={16} />
                  创建批次
                </button>
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
  const [inventoryItems, setInventoryItems] = useState<InventoryRecord[]>(INVENTORY_ITEMS);
  const [inventoryDetailMap, setInventoryDetailMap] = useState<Record<string, InventoryBatchDetail>>(INVENTORY_DETAIL_MAP);
  const [view, setView] = useState<InventoryView>("card");
  const [currentPage, setCurrentPage] = useState(1);
  const [cardPageSize, setCardPageSize] = useState(LIST_PAGE_SIZE);
  const [selectedItem, setSelectedItem] = useState<InventoryRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [newBatchForm, setNewBatchForm] = useState<NewBatchFormState>({
    ...DEFAULT_NEW_BATCH_FORM,
    manufactureDate: new Date().toISOString().slice(0, 10),
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newBatchError, setNewBatchError] = useState<string | null>(null);
  const cardGridRef = useRef<HTMLDivElement | null>(null);
  const sortedItems = useMemo(() => sortInventoryItems(inventoryItems), [inventoryItems]);

  const selectedMetrics = useMemo(
    () => (selectedItem ? getShelfLifeMetrics(selectedItem) : null),
    [selectedItem],
  );
  const selectedDetail = useMemo(
    () => (selectedItem ? inventoryDetailMap[selectedItem.id] ?? null : null),
    [inventoryDetailMap, selectedItem],
  );
  const batchSearchResults = useMemo(() => {
    const query = newBatchForm.query.trim().toLowerCase();

    if (!query) {
      return INITIAL_PRODUCTS.slice(0, 6);
    }

    const exactBarcode = INITIAL_PRODUCTS.find((product) => product.barcode.toLowerCase() === query);
    if (exactBarcode) {
      return [exactBarcode];
    }

    return INITIAL_PRODUCTS.filter((product) => {
      const productName = product.product_name.toLowerCase();
      const manufacturer = product.manufacturer.toLowerCase();
      const barcode = product.barcode.toLowerCase();

      return productName.includes(query) || manufacturer.includes(query) || barcode.includes(query);
    }).slice(0, 6);
  }, [newBatchForm.query]);
  const expirePreview = useMemo(
    () =>
      selectedProduct && newBatchForm.manufactureDate
        ? getExpireDateFromManufacture(newBatchForm.manufactureDate, selectedProduct.shelf_life_days)
        : null,
    [newBatchForm.manufactureDate, selectedProduct],
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

  const openCreateBatchModal = () => {
    setIsCreateBatchOpen(true);
    setSelectedProduct(null);
    setNewBatchError(null);
    setNewBatchForm({
      ...DEFAULT_NEW_BATCH_FORM,
      manufactureDate: new Date().toISOString().slice(0, 10),
    });
  };

  const closeCreateBatchModal = () => {
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

  const handleCreateBatch = () => {
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

    const nextId = getNextInventoryId(inventoryItems);
    const receivedDate = new Date().toISOString();
    const expireDate = getExpireDateFromManufacture(newBatchForm.manufactureDate, selectedProduct.shelf_life_days);
    const nextItem: InventoryRecord = {
      id: nextId,
      quantity: newBatchForm.quantity,
      manufacturer: selectedProduct.manufacturer,
      productName: selectedProduct.product_name,
      category: selectedProduct.category ?? "未分类",
      location: selectedProduct.location ?? "待分配库位",
      manufactureDate: newBatchForm.manufactureDate,
      expireDate,
      receivedDate,
    };
    const metrics = getShelfLifeMetrics(nextItem);
    const batchId = `#BT-${Date.now().toString().slice(-6)}`;
    const temperatureMeta = getTemperatureMeta(selectedProduct.location);
    const nextDetail: InventoryBatchDetail = {
      sku: selectedProduct.barcode || `PRD-${selectedProduct.id}`,
      currentStock: parseQuantity(nextItem.quantity),
      averageLossRate: "0.0",
      batchCount: 1,
      primaryBatchId: batchId,
      storageRequirements: [
        {
          label: "目标温度",
          value: temperatureMeta.value,
          subValue: temperatureMeta.subValue,
          icon: "temperature",
          colorClassName: temperatureMeta.colorClassName,
        },
        {
          label: "目标湿度",
          value: "70%",
          subValue: "默认",
          icon: "humidity",
          colorClassName: "bg-cyan-50 text-cyan-600",
        },
      ],
      relatedBatches: [
        {
          id: batchId,
          quantity: parseQuantity(nextItem.quantity),
          manufactureDate: nextItem.manufactureDate,
          expireDate: nextItem.expireDate,
          progress: metrics.percent,
          remainingDays: metrics.remainingDays,
          health: metrics.health,
        },
      ],
    };

    setInventoryItems((currentItems) => [nextItem, ...currentItems]);
    setInventoryDetailMap((currentMap) => ({ ...currentMap, [nextItem.id]: nextDetail }));
    closeCreateBatchModal();
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
    if (!isCreateBatchOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCreateBatchModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCreateBatchOpen]);

  useEffect(() => {
    if (!isCreateBatchOpen) {
      return;
    }

    const query = newBatchForm.query.trim().toLowerCase();
    if (!query) {
      return;
    }

    const exactBarcode = INITIAL_PRODUCTS.find((product) => product.barcode.toLowerCase() === query);
    if (exactBarcode) {
      setSelectedProduct((currentProduct) => (currentProduct?.id === exactBarcode.id ? currentProduct : exactBarcode));
    }
  }, [isCreateBatchOpen, newBatchForm.query]);

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
        <button
          type="button"
          onClick={openCreateBatchModal}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
        >
          <Plus size={18} />
          新建批次
        </button>
      </div>

      <InventoryOverviewCards items={inventoryItems} />

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

      <NewBatchModal
        open={isCreateBatchOpen}
        form={newBatchForm}
        selectedProduct={selectedProduct}
        searchResults={batchSearchResults}
        expireDate={expirePreview}
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
