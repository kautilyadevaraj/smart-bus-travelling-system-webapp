"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
  weekday: {
    label: "Weekday",
    color: "var(--chart-1)",
  },
  weekend: {
    label: "Weekend",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function WeekdayVsWeekendChart() {
  const [chartData, setChartData] = React.useState<
    { month: string; weekday: number; weekend: number }[]
  >([]);
  const [trendPercentage, setTrendPercentage] = React.useState(0);
  const [weekdayCount, setWeekdayCount] = React.useState(0);
  const [weekendCount, setWeekendCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/weekday-vs-weekend");
        const result = await response.json();
        setChartData(result.data || []);
        setTrendPercentage(result.summary?.trendPercentage || 0);
        setWeekdayCount(result.summary?.weekdayCount || 0);
        setWeekendCount(result.summary?.weekendCount || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekday vs Weekend</CardTitle>
        <CardDescription>Comparison of travel patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="weekday" fill="var(--color-weekday)" radius={4} />
            <Bar dataKey="weekend" fill="var(--color-weekend)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 leading-none font-medium">
          {trendPercentage > 0 ? (
            <>
              More weekday rides by {Math.abs(trendPercentage)}%
              <TrendingUp className="h-4 w-4" />
            </>
          ) : (
            <>More weekend rides by {Math.abs(trendPercentage)}%</>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          Weekday: {weekdayCount} rides | Weekend: {weekendCount} rides
        </div>
      </CardFooter>
    </Card>
  );
}
