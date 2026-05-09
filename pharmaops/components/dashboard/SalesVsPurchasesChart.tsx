"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesPurchasesPoint } from "@/lib/analytics/timeseries";
import { formatEur, formatEurCompact } from "@/lib/utils/format";

interface Props {
  data: SalesPurchasesPoint[];
}

export function SalesVsPurchasesChart({ data }: Props) {
  // Highlight the partial-month bucket with a soft band so the trailing
  // dip reads as "incomplete data" rather than "real drop".
  const partialIndex = data.findIndex((p) => p.partial);
  const partialLabel = partialIndex >= 0 ? data[partialIndex]!.label : null;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3a8a73" stopOpacity={0.32} />
              <stop offset="95%" stopColor="#3a8a73" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="purchasesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0369a1" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickFormatter={(value) => formatEurCompact(value)}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              fontSize: 12,
            }}
            formatter={(value: number, name) => {
              if (name === "Margen") {
                return value === null
                  ? ["—", "Margen"]
                  : [`${(value * 100).toFixed(1)} %`, "Margen"];
              }
              return [formatEur(value), name as string];
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#475569" }} />
          <Area
            type="monotone"
            dataKey="sales"
            name="Ventas (neto)"
            stroke="#3a8a73"
            fill="url(#salesFill)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="purchases"
            name="Compras (neto)"
            stroke="#0369a1"
            fill="url(#purchasesFill)"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="margin"
            name="Margen"
            stroke="#dc2626"
            strokeWidth={1.5}
            dot={false}
            yAxisId={0}
            hide
          />
          {partialLabel ? (
            <ReferenceArea
              x1={partialLabel}
              x2={partialLabel}
              y1={0}
              ifOverflow="visible"
              fill="#94a3b8"
              fillOpacity={0.08}
              stroke="#94a3b8"
              strokeOpacity={0.25}
              strokeDasharray="3 3"
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
      {partialLabel ? (
        <p className="-mt-1 text-[11px] text-ink-500">
          El último mes ({partialLabel.replace(" (parcial)", "")}) está aún en
          curso — los importes son parciales hasta hoy.
        </p>
      ) : null}
    </div>
  );
}
