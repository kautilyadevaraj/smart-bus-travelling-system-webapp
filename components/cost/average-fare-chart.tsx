"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

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

export const description = "A line chart with a label";

const chartData = [
  { month: "January", avgFare: 18 },
  { month: "February", avgFare: 305 },
  { month: "March", avgFare: 237 },
  { month: "April", avgFare: 73 },
  { month: "May", avgFare: 209 },
  { month: "June", avgFare: 214 },
  { month: "July", avgFare: 214 },
];

const chartConfig = {
  avgFare: {
    label: "avgFare",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AverageFareChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Fare Over Time</CardTitle>
        <CardDescription>Monthly average fare trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="avgFare"
              type="natural"
              stroke="var(--color-avgFare)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-avgFare)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
