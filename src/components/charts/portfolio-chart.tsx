"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface PortfolioDataPoint {
  date: Date | string;
  value: number;
  cashValue?: number;
  positionsValue?: number;
}

interface PortfolioChartProps {
  data: PortfolioDataPoint[];
  height?: number;
  showCashSplit?: boolean;
  theme?: "light" | "dark";
}

export function PortfolioChart({
  data,
  height = 300,
  showCashSplit = false,
  theme = "light",
}: PortfolioChartProps) {
  const option: EChartsOption = useMemo(() => {
    const dates = data.map((d) =>
      new Date(d.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );

    const totalValues = data.map((d) => d.value);

    const startValue = data[0]?.value || 0;
    const endValue = data[data.length - 1]?.value || 0;
    const changePercent = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0;
    const isPositive = changePercent >= 0;

    const baseOption: EChartsOption = {
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const p = Array.isArray(params) ? params[0] : params;
          if (!p || typeof p !== "object" || !("value" in p)) return "";
          const value = p.value as number;
          const idx = p.dataIndex as number;
          const date = dates[idx];
          return `<div class="font-sans">
            <div class="text-sm text-muted-foreground">${date}</div>
            <div class="text-lg font-bold">$${value.toLocaleString()}</div>
          </div>`;
        },
        backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
        borderColor: theme === "dark" ? "#334155" : "#e2e8f0",
        textStyle: {
          color: theme === "dark" ? "#f1f5f9" : "#0f172a",
        },
      },
      grid: {
        left: "3%",
        right: "3%",
        top: "10%",
        bottom: "10%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: theme === "dark" ? "#334155" : "#e2e8f0",
          },
        },
        axisLabel: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
        },
      },
      yAxis: {
        type: "value",
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: theme === "dark" ? "#1e293b" : "#f1f5f9",
          },
        },
        axisLabel: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
          formatter: (value: number) => `$${(value / 1000).toFixed(0)}k`,
        },
      },
      series: [
        {
          name: "Portfolio Value",
          type: "line",
          data: totalValues,
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: isPositive ? "#22c55e" : "#ef4444",
            width: 2,
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: isPositive
                    ? "rgba(34, 197, 94, 0.3)"
                    : "rgba(239, 68, 68, 0.3)",
                },
                {
                  offset: 1,
                  color: isPositive
                    ? "rgba(34, 197, 94, 0.05)"
                    : "rgba(239, 68, 68, 0.05)",
                },
              ],
            },
          },
        },
      ],
    };

    // Add stacked area for cash/positions split
    if (showCashSplit && data.some((d) => d.cashValue !== undefined)) {
      const cashValues = data.map((d) => d.cashValue || 0);
      const positionValues = data.map((d) => d.positionsValue || 0);

      baseOption.series = [
        {
          name: "Positions",
          type: "line",
          stack: "total",
          data: positionValues,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 0 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 130, 246, 0.5)" },
                { offset: 1, color: "rgba(59, 130, 246, 0.1)" },
              ],
            },
          },
        },
        {
          name: "Cash",
          type: "line",
          stack: "total",
          data: cashValues,
          smooth: true,
          symbol: "none",
          lineStyle: { width: 0 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(168, 162, 158, 0.5)" },
                { offset: 1, color: "rgba(168, 162, 158, 0.1)" },
              ],
            },
          },
        },
      ];

      baseOption.legend = {
        data: ["Positions", "Cash"],
        top: 0,
        textStyle: {
          color: theme === "dark" ? "#94a3b8" : "#64748b",
        },
      };
    }

    return baseOption;
  }, [data, showCashSplit, theme]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No portfolio data available
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}
