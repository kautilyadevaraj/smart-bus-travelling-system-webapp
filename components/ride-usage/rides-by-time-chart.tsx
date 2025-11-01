"use client";

import { TrendingUp } from "lucide-react";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import * as React from "react";

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
  rides: {
    label: "Rides",
  },
  "6-9 AM": {
    label: "6-9 AM",
    color: "var(--chart-1)",
  },
  "12-3 PM": {
    label: "12-3 PM",
    color: "var(--chart-2)",
  },
  "6-9 PM": {
    label: "6-9 PM",
    color: "var(--chart-3)",
  },
  "12-3 AM": {
    label: "12-3 AM",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function RidesByTimeChart() {
  const [chartData, setChartData] = React.useState<
    { time: string; rides: number; fill: string }[]
  >([]);
  const [peakTime, setPeakTime] = React.useState("");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/rides-by-time");
        const result = await response.json();
        setChartData(result.data || []);
        setPeakTime(result.summary?.peakTime || "");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rides by Time of Day</CardTitle>
        <CardDescription>Peak travel ranges throughout the day</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
            }}
          >
            <YAxis
              dataKey="time"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <XAxis dataKey="rides" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="rides" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Peak time: <span className="text-yellow-600">{peakTime}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
