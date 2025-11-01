"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  avgDistance: {
    label: "Avg Distance (km)",
    color: "var(--chart-1)",
  },
  avgDuration: {
    label: "Avg Duration (min)",
    color: "var(--chart-2)",
  },
  avgFare: {
    label: "Avg Fare (₹)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function TripEfficiencyChart() {
  const [chartData, setChartData] = React.useState<
    {
      month: string;
      avgDistance: number;
      avgDuration: number;
      avgFare: number;
    }[]
  >([]);
  const [distanceTrend, setDistanceTrend] = React.useState(0);
  const [fareTrend, setFareTrend] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/trip-efficiency");
        const result = await response.json();
        setChartData(result.data || []);
        setDistanceTrend(result.summary?.distanceTrend || 0);
        setFareTrend(result.summary?.fareTrend || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const performanceTrend = (distanceTrend + fareTrend) / 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Performance Overview</CardTitle>
        <CardDescription>Average metrics per month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
            stackOffset="expand"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="avgFare"
              type="natural"
              fill="var(--color-avgFare)"
              fillOpacity={0.3}
              stroke="var(--color-avgFare)"
              stackId="a"
            />
            <Area
              dataKey="avgDuration"
              type="natural"
              fill="var(--color-avgDuration)"
              fillOpacity={0.4}
              stroke="var(--color-avgDuration)"
              stackId="a"
            />
            <Area
              dataKey="avgDistance"
              type="natural"
              fill="var(--color-avgDistance)"
              fillOpacity={0.5}
              stroke="var(--color-avgDistance)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 leading-none font-medium">
          Performance {performanceTrend > 0 ? "up" : "down"} by{" "}
          {Math.abs(performanceTrend).toFixed(1)}% this period
          {performanceTrend > 0 && <TrendingUp className="h-4 w-4" />}
        </div>
        <div className="text-muted-foreground leading-none">
          Distance trend: {distanceTrend > 0 ? "+" : ""}
          {distanceTrend.toFixed(1)}% | Fare trend: {fareTrend > 0 ? "+" : ""}
          {fareTrend.toFixed(1)}%
        </div>
      </CardFooter>
    </Card>
  );
}
