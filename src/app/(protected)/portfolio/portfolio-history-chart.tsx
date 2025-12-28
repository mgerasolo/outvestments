"use client";

import { PortfolioChart } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioHistoryChartProps {
  data: Array<{
    date: Date;
    value: number;
    cash: number;
    positions: number;
  }>;
}

export function PortfolioHistoryChart({ data }: PortfolioHistoryChartProps) {
  if (data.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <p>Not enough data for chart. Check back after a few trading days.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform data for chart component
  const chartData = data.map((d) => ({
    date: d.date,
    value: d.value,
    cashValue: d.cash,
    positionsValue: d.positions,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Portfolio History</CardTitle>
      </CardHeader>
      <CardContent>
        <PortfolioChart data={chartData} height={250} showCashSplit />
      </CardContent>
    </Card>
  );
}
