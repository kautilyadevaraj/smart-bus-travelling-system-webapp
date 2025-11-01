"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function RidesByDayChart() {
  const [chartData, setChartData] = React.useState<
    { day: string; rides: number }[]
  >([]);
  const [mostActiveDay, setMostActiveDay] = React.useState("");
  const [mostActiveDayCount, setMostActiveDayCount] = React.useState(0);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/dashboard/rides-by-day");
        const result = await response.json();
        setChartData(result.data || []);
        setMostActiveDay(result.summary?.mostActiveDay || "");
        setMostActiveDayCount(result.summary?.mostActiveDayCount || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Rides by Day of Week</CardTitle>
        <CardDescription>Showing rides on each day of the week</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="day" />
            <PolarGrid />
            <Radar
              dataKey="rides"
              fill="var(--color-rides)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-center gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Most active day:{" "}
          <span className="text-blue-600">{mostActiveDay}</span>{" "}
          <span className="text-gray-500">({mostActiveDayCount} rides)</span>
        </div>
      </CardFooter>
    </Card>
  );
}
