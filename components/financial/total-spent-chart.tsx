"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive area chart";

const chartData = [
  { date: "2024-04-01", spent: 222 },
  { date: "2024-04-02", spent: 97 },
  { date: "2024-04-03", spent: 167 },
  { date: "2024-04-04", spent: 242 },
  { date: "2024-04-05", spent: 373 },
  { date: "2024-04-06", spent: 301 },
  { date: "2024-04-07", spent: 245 },
  { date: "2024-04-08", spent: 409 },
  { date: "2024-04-09", spent: 59 },
  { date: "2024-04-10", spent: 261 },
  { date: "2024-04-11", spent: 327 },
  { date: "2024-04-12", spent: 292 },
  { date: "2024-04-13", spent: 342 },
  { date: "2024-04-14", spent: 137 },
  { date: "2024-04-15", spent: 120 },
  { date: "2024-04-16", spent: 138 },
  { date: "2024-04-17", spent: 446 },
  { date: "2024-04-18", spent: 364 },
  { date: "2024-04-19", spent: 243 },
  { date: "2024-04-20", spent: 89 },
  { date: "2024-04-21", spent: 137 },
  { date: "2024-04-22", spent: 224 },
  { date: "2024-04-23", spent: 138 },
  { date: "2024-04-24", spent: 387 },
  { date: "2024-04-25", spent: 215 },
  { date: "2024-04-26", spent: 75 },
  { date: "2024-04-27", spent: 383 },
  { date: "2024-04-28", spent: 122 },
  { date: "2024-04-29", spent: 315 },
  { date: "2024-04-30", spent: 454 },
  { date: "2024-05-01", spent: 165 },
  { date: "2024-05-02", spent: 293 },
  { date: "2024-05-03", spent: 247 },
  { date: "2024-05-04", spent: 385 },
  { date: "2024-05-05", spent: 481 },
  { date: "2024-05-06", spent: 498 },
  { date: "2024-05-07", spent: 388 },
  { date: "2024-05-08", spent: 149 },
  { date: "2024-05-09", spent: 227 },
  { date: "2024-05-10", spent: 293 },
  { date: "2024-05-11", spent: 335 },
  { date: "2024-05-12", spent: 197 },
  { date: "2024-05-13", spent: 197 },
  { date: "2024-05-14", spent: 448 },
  { date: "2024-05-15", spent: 473 },
  { date: "2024-05-16", spent: 338 },
  { date: "2024-05-17", spent: 499 },
  { date: "2024-05-18", spent: 315 },
  { date: "2024-05-19", spent: 235 },
  { date: "2024-05-20", spent: 177 },
  { date: "2024-05-21", spent: 82 },
  { date: "2024-05-22", spent: 81 },
  { date: "2024-05-23", spent: 252 },
  { date: "2024-05-24", spent: 294 },
  { date: "2024-05-25", spent: 201 },
];

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  spent: {
    label: "spent",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function TotalSpentChart() {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date("2024-06-30");
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Total Spent Over Time</CardTitle>
          <CardDescription>Daily spending trend</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillspent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-spent)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-spent)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="spent"
              type="natural"
              fill="url(#fillspent)"
              stroke="var(--color-spent)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
