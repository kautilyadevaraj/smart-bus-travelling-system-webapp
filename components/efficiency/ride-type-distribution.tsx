"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

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
  short_ride: {
    label: "Short Ride",
    color: "var(--chart-1)",
  },
  long_ride: {
    label: "Long Ride",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function RideTypeDistribution() {
  const [chartData, setChartData] = React.useState<
    { month: string; short_ride: number; long_ride: number }[]
  >([{ month: "january", short_ride: 0, long_ride: 0 }]);
  const [summary, setSummary] = React.useState({
    shortRideCount: 0,
    longRideCount: 0,
    shortRidePercentage: 0,
    longRidePercentage: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/ride-type-distribution");
        const result = await response.json();
        setChartData(result.data || [{ month: "january", short_ride: 0, long_ride: 0 }]);
        setSummary(result.summary || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const totalVisitors = chartData[0]?.short_ride + chartData[0]?.long_ride || 0;

  return (
    <Card className="flex flex-col h-fit">
      <CardHeader className="items-center pb-0">
        <CardTitle>Long vs Short Rides</CardTitle>
        <CardDescription>Distribution by distance category</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                className="h-fit"
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Rides
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="short_ride"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-short_ride)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="long_ride"
              fill="var(--color-long_ride)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            Short rides (≤10km): <span className="font-semibold text-blue-600">{summary.shortRidePercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            Long rides {"(>10km)"}: <span className="font-semibold text-orange-600">{summary.longRidePercentage}%</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
