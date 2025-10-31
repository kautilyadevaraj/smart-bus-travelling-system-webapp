"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";

export const description = "A donut chart with text";

const chartData = [
  { dist: "0-5 km", rides: 35, fill: "var(--chart-1)" },
  { dist: "5-10 km", rides: 45, fill: "var(--chart-2)" },
  { dist: "10-15 km", rides: 15, fill: "var(--chart-3)" },
  { dist: "15+ km", rides: 5, fill: "var(--chart-4)" },
];

const chartConfig = {
  rides: {
    label: "Rides",
  },
  "0-5 km": {
    label: "0-5 km",
    color: "var(--chart-1)",
  },
  "5-10 km": {
    label: "5-10 km",
    color: "var(--chart-2)",
  },
  "10-15 km": {
    label: "10-15 km",
    color: "var(--chart-3)",
  },
  "15+ km": {
    label: "15+ km",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function DistanceDistribution() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.rides, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Distance Distribution</CardTitle>
        <CardDescription>Ride distance categories</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="rides"
              nameKey="dist"
              innerRadius={45}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Rides
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="dist" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
