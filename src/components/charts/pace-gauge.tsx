"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import type { PaceStatus } from "@/lib/pace-tracking";

interface PaceGaugeProps {
  currentPace: number; // Monthly return rate (e.g., 5 for 5%)
  requiredPace: number; // Required monthly return
  status: PaceStatus;
  height?: number;
  theme?: "light" | "dark";
}

export function PaceGauge({
  currentPace,
  requiredPace,
  status,
  height = 200,
  theme = "light",
}: PaceGaugeProps) {
  const option: EChartsOption = useMemo(() => {
    // Calculate pace ratio (100 = on pace)
    const paceRatio = requiredPace > 0 ? (currentPace / requiredPace) * 100 : 100;

    // Clamp between 0 and 200 for display
    const displayValue = Math.max(0, Math.min(200, paceRatio));

    // Get color based on status
    const colors: Record<PaceStatus, string> = {
      ahead: "#22c55e",
      on_pace: "#3b82f6",
      behind: "#ef4444",
      unknown: "#6b7280",
    };

    const color = colors[status];

    return {
      series: [
        {
          type: "gauge",
          startAngle: 180,
          endAngle: 0,
          min: 0,
          max: 200,
          radius: "100%",
          center: ["50%", "75%"],
          splitNumber: 4,
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [0.45, "#ef4444"], // 0-90 (behind)
                [0.55, "#3b82f6"], // 90-110 (on pace)
                [1, "#22c55e"], // 110-200 (ahead)
              ],
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 12,
            lineStyle: {
              width: 2,
              color: theme === "dark" ? "#475569" : "#cbd5e1",
            },
          },
          axisLabel: {
            distance: 25,
            color: theme === "dark" ? "#94a3b8" : "#64748b",
            fontSize: 11,
            formatter: (value: number) => {
              if (value === 0) return "0%";
              if (value === 100) return "100%";
              if (value === 200) return "200%";
              return "";
            },
          },
          pointer: {
            icon: "path://M12 2L15.5 8.5 22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14l-5-4.87 6.5-.77L12 2z",
            length: "60%",
            width: 12,
            offsetCenter: [0, "-30%"],
            itemStyle: {
              color,
            },
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 16,
            itemStyle: {
              borderWidth: 2,
              borderColor: color,
              color: theme === "dark" ? "#1e293b" : "#ffffff",
            },
          },
          title: {
            show: true,
            offsetCenter: [0, "20%"],
            fontSize: 12,
            color: theme === "dark" ? "#94a3b8" : "#64748b",
          },
          detail: {
            valueAnimation: true,
            fontSize: 24,
            fontWeight: "bold",
            offsetCenter: [0, "-5%"],
            formatter: () => `${paceRatio.toFixed(0)}%`,
            color,
          },
          data: [
            {
              value: displayValue,
              name: status === "ahead" ? "Ahead" : status === "behind" ? "Behind" : "On Pace",
            },
          ],
        },
      ],
    };
  }, [currentPace, requiredPace, status, theme]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}
