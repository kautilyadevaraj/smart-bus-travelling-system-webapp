"use client";

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

export const description = "A multiple bar chart";

const chartData = [
  { month: "Ride Count", weekday: 186, weekend: 80 },
  { month: "Avg Duration (min)", weekday: 305, weekend: 200 },
  { month: "Avg Fare (₹)", weekday: 237, weekend: 120 },
];

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
        <CardFooter className="flex-col gap-2 text-sm pt-4">
          <div className="flex items-center gap-2 leading-none font-medium">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="text-muted-foreground leading-none">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
