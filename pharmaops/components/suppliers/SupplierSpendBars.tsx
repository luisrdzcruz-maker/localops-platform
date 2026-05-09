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
import { formatEur, formatEurCompact } from "@/lib/utils/format";

interface Props {
  /**
   * One entry per month in the chart window. The caller (suppliers.ts)
   * guarantees a full window: zero amounts for months without invoices.
   */
  data: Array<{ month: string; label: string; amount: number }>;
}

export function SupplierSpendBars({ data }: Props) {
  // When every month is zero, give recharts a tiny ceiling so the axis
  // doesn't collapse to a single tick.
  const max = data.reduce((acc, p) => Math.max(acc, p.amount), 0);
  const yDomain: [number, number | "auto"] = max === 0 ? [0, 100] : [0, "auto"];

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            domain={yDomain}
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(v: number) => formatEurCompact(v)}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(58,138,115,0.06)" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(v: number) => [formatEur(v), "Gasto"]}
          />
          <Bar dataKey="amount" fill="#3a8a73" radius={[6, 6, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
