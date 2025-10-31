import { DashboardHero } from "@/components/dashboard-hero";
import { TotalSpentChart } from "@/components/financial/total-spent-chart";
import { RidesByTimeChart } from "@/components/ride-usage/rides-by-time-chart";
import { RidesByDayChart } from "@/components/ride-usage/rides-by-day-chart";
import { DistanceDistribution } from "@/components/routes/distance-distribution";
import { AverageFareChart } from "@/components/cost/average-fare-chart";
import { WeekdayVsWeekendChart } from "@/components/efficiency/weekday-vs-weekend-chart";
import { RideTypeDistribution } from "@/components/efficiency/ride-type-distribution";
import { TripEfficiencyChart } from "@/components/efficiency/trip-efficiency-chart";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pb-8 space-y-6">
        {/* Hero Section */}
        <DashboardHero />

        {/* Row 1: Financial Overview */}

        <TotalSpentChart />

        {/* Row 2: Usage Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RidesByTimeChart />
          <RidesByDayChart />
        </div>

        {/* Row 4: Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistanceDistribution />
          <AverageFareChart />
        </div>

        {/* Row 6: Efficiency Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-fit">
          <WeekdayVsWeekendChart />
          <RideTypeDistribution />
          <TripEfficiencyChart />
        </div>
      </div>
    </main>
  );
}
