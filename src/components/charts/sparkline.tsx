"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "gain" | "loss" | "neutral" | "auto";
  showArea?: boolean;
}

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = "auto",
  showArea = true,
}: SparklineProps) {
  const option: EChartsOption = useMemo(() => {
    if (data.length === 0) {
      return { series: [] };
    }

    // Determine color based on data trend
    let lineColor = "#6b7280"; // neutral gray
    if (color === "auto") {
      const first = data[0];
      const last = data[data.length - 1];
      lineColor = last >= first ? "#22c55e" : "#ef4444";
    } else if (color === "gain") {
      lineColor = "#22c55e";
    } else if (color === "loss") {
      lineColor = "#ef4444";
    }

    return {
      grid: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      },
      xAxis: {
        type: "category",
        show: false,
        data: data.map((_, i) => i),
      },
      yAxis: {
        type: "value",
        show: false,
        min: "dataMin",
        max: "dataMax",
      },
      series: [
        {
          type: "line",
          data: data,
          smooth: true,
          symbol: "none",
          lineStyle: {
            color: lineColor,
            width: 1.5,
          },
          areaStyle: showArea
            ? {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: `${lineColor}40` },
                    { offset: 1, color: `${lineColor}05` },
                  ],
                },
              }
            : undefined,
        },
      ],
    };
  }, [data, color, showArea]);

  if (data.length === 0) {
    return (
      <div
        className="bg-muted rounded"
        style={{ width, height }}
      />
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ width, height }}
      opts={{ renderer: "canvas" }}
    />
  );
}
