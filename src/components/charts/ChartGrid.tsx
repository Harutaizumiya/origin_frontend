import React from "react";
import { TrendChart } from "./TrendChart";
import { DistributionChart } from "./DistributionChart";

export const ChartGrid: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
    {/* Trend Chart */}
    <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl ambient-shadow border border-surface-container/10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h4 className="text-lg font-bold text-on-surface font-headline">
            库存到期趋势 (未来30天)
          </h4>
          <p className="text-xs text-on-surface-variant mt-1">
            基于当前批次效期预测的流转压力
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg">
            按天
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-surface-container-high text-on-surface-variant rounded-lg">
            按周
          </button>
        </div>
      </div>

      <TrendChart />
    </div>

    {/* Distribution */}
    <div className="bg-surface-container-lowest p-8 rounded-3xl ambient-shadow border border-surface-container/10">
      <h4 className="text-lg font-bold text-on-surface font-headline mb-8">
        品类库存分布
      </h4>
      <DistributionChart />
    </div>
  </div>
);
