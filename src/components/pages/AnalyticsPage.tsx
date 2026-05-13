import React from "react";
import { Activity, Download, MoreHorizontal, RefreshCw, Timer, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "../../lib/utils";
import { useSidebarAnimating } from "../layout/LayoutContext";
import { StatCard } from "../dashboard/StatCard";

const STOCK_LOSS_TREND = [
  { month: "1月", stockQuantity: 4500, lossQuantity: 210 },
  { month: "2月", stockQuantity: 5200, lossQuantity: 180 },
  { month: "3月", stockQuantity: 4800, lossQuantity: 250 },
  { month: "4月", stockQuantity: 6100, lossQuantity: 190 },
  { month: "5月", stockQuantity: 5900, lossQuantity: 150 },
  { month: "6月", stockQuantity: 7200, lossQuantity: 120 },
];

const THROUGHPUT_DATA = [
  { category: "肉类", inbound: 450, outbound: 380 },
  { category: "乳制品", inbound: 620, outbound: 590 },
  { category: "烘焙", inbound: 310, outbound: 290 },
  { category: "蔬菜", inbound: 840, outbound: 810 },
  { category: "其他", inbound: 200, outbound: 180 },
];

const RISK_RANKING_DATA = [
  { name: "澳洲安格斯牛肉 300g", riskType: "临期批次", days: "1.0", score: 96, color: "text-red-600" },
  { name: "巴氏杀菌全脂牛奶 1L", riskType: "报损频繁", days: "3.0", score: 88, color: "text-orange-600" },
  { name: "法式牛角包 6件装", riskType: "临期批次", days: "4.0", score: 82, color: "text-amber-600" },
  { name: "有机小菠菜 200g", riskType: "库存偏高", days: "8.0", score: 73, color: "text-primary" },
];

function ChartSkeleton({ vertical = false }: { vertical?: boolean }) {
  return (
    <div className="h-80 w-full">
      {vertical ? (
        <div className="flex h-full flex-col justify-center gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-3 w-14 rounded-full bg-slate-200/80" />
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full rounded-full bg-slate-300/80" style={{ width: `${65 + ((index * 7) % 20)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-end gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 rounded-t-2xl bg-slate-200/80"
              style={{ height: `${42 + ((index * 9) % 38)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsMetrics() {
  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <StatCard
        title="库存变动次数"
        value="248"
        trend="入库 / 出库 / 报损"
        trendType="up"
        icon={<RefreshCw size={24} />}
        iconBg="bg-primary/10"
        iconColor="text-primary"
      />
      <StatCard
        title="本月报损数量"
        value="120"
        trend="较上月 -15%"
        trendType="up"
        icon={<TrendingDown size={24} />}
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
      />
      <StatCard
        title="平均库龄"
        value="12.5 天"
        trend="按批次估算"
        trendType="neutral"
        icon={<Timer size={24} />}
        iconBg="bg-amber-500/10"
        iconColor="text-amber-600"
      />
    </div>
  );
}

function AnalyticsCharts() {
  const isSidebarAnimating = useSidebarAnimating();

  return (
    <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
      <section className="ambient-shadow rounded-3xl border border-surface-container/10 bg-surface-container-lowest p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">库存数量与报损趋势</h3>
            <p className="mt-1 text-sm text-on-surface-variant">查看近六个月在库数量与报损数量的变化。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">月度趋势</div>
        </div>
        {isSidebarAnimating ? (
          <ChartSkeleton />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STOCK_LOSS_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Bar dataKey="stockQuantity" name="在库数量" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="lossQuantity" name="报损数量" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <section className="ambient-shadow rounded-3xl border border-surface-container/10 bg-surface-container-lowest p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface">品类出入库操作量</h3>
            <p className="mt-1 text-sm text-on-surface-variant">比较各品类的入库、出库与报损操作数量。</p>
          </div>
          <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">操作分布</div>
        </div>
        {isSidebarAnimating ? (
          <ChartSkeleton vertical />
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={THROUGHPUT_DATA} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="category"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.08)",
                  }}
                />
                <Bar dataKey="inbound" name="入库量" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={12} />
                <Bar dataKey="outbound" name="出库/报损量" fill="#7dd3fc" radius={[0, 6, 6, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}

function RiskRankingTable() {
  return (
    <section className="ambient-shadow overflow-hidden rounded-3xl border border-surface-container/10 bg-surface-container-lowest">
      <div className="flex items-center justify-between border-b border-surface-container-high p-8">
        <div>
          <h3 className="font-headline text-xl font-bold text-on-surface">高风险库存排行</h3>
          <p className="mt-1 text-sm text-on-surface-variant">按剩余效期、库存数量与报损记录综合排序。</p>
        </div>
        <button className="text-on-surface-variant transition-colors hover:text-primary" type="button">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low/50">
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">产品</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">风险类型</th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                剩余效期
              </th>
              <th className="px-8 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                风险评分
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-low">
            {RISK_RANKING_DATA.map((item) => (
              <tr key={item.name} className="transition-colors hover:bg-surface-container-low/30">
                <td className="px-8 py-5 text-sm font-bold text-on-surface">{item.name}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{item.riskType}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant">{item.days} 天</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-container">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${item.score}%` }} />
                    </div>
                    <span className={cn("text-sm font-bold", item.color)}>{item.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export const AnalyticsPage: React.FC = () => {
  return (
    <>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">分析</h2>
          <p className="mt-1 text-on-surface-variant">围绕库存数量、效期风险与批次操作，观察仓储运营的关键变化。</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
          >
            <Download size={16} />
            下载报告
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-3 rounded-3xl border border-surface-container/10 bg-surface-container-lowest p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Activity size={16} className="text-primary" />
          <span>默认展示过去 6 个月数据，重点突出库存变动、报损数量与高风险批次。</span>
        </div>
        <button
          type="button"
          className="inline-flex w-fit items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary"
        >
          过去 6 个月
        </button>
      </div>

      <AnalyticsMetrics />
      <AnalyticsCharts />
      <RiskRankingTable />
    </>
  );
};
