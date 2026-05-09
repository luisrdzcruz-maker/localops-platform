"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SupplierSpendPoint } from "@/lib/analytics/timeseries";
import { formatEur, formatEurCompact } from "@/lib/utils/format";

interface Props {
  data: SupplierSpendPoint[];
}

export function SupplierSpendChart({ data }: Props) {
  // Show only top 6 to keep the chart legible.
  const top = data.slice(0, 6);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top}
          layout="vertical"
          margin={{ top: 10, right: 24, bottom: 0, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(value: number) => formatEurCompact(value)}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="supplier"
            tick={{ fontSize: 12, fill: "#475569" }}
            width={140}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(58,138,115,0.06)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value: number) => [formatEur(value), "Gasto"]}
          />
          <Bar
            dataKey="amount"
            fill="#3a8a73"
            radius={[0, 6, 6, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
