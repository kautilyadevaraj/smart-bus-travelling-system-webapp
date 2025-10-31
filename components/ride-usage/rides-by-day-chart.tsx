"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

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

export const description = "A radar chart with dots";

const chartData = [
  { day: "Mon", rides: 186 },
  { day: "Tues", rides: 305 },
  { day: "Wed", rides: 237 },
  { day: "Thurs", rides: 273 },
  { day: "Fri", rides: 209 },
  { day: "Sat", rides: 214 },
  { day: "Sun", rides: 214 },
];

const chartConfig = {
  rides: {
    label: "Rides",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function RidesByDayChart() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle>Rides by Day of Week</CardTitle>
        <CardDescription>
          Showing rides on each day of the week
        </CardDescription>
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
    </Card>
  );
}
