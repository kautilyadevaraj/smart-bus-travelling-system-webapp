"use client";

import * as React from "react";
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

const chartConfig = {
  avgFare: {
    label: "avgFare",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function AverageFareChart() {
  const [chartData, setChartData] = React.useState<
    { month: string; avgFare: number }[]
  >([]);
  const [overallAverage, setOverallAverage] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/average-fare");
        const result = await response.json();
        setChartData(result.data || []);
        setOverallAverage(result.summary?.overallAverage || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Overall average:{" "}
          <span className="text-green-600">
            ₹{overallAverage.toLocaleString()}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
