"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Navigation, DollarSign } from "lucide-react";

interface StatItem {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: "up" | "down";
}

export function DashboardHero() {
  const [stats, setStats] = React.useState<StatItem[]>([
    {
      title: "Total Rides",
      value: "-",
      change: "0%",
      icon: Navigation,
      trend: "up",
    },
    {
      title: "Total Spent",
      value: "-",
      change: "0%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Current Balance",
      value: "-",
      change: "0%",
      icon: Wallet,
      trend: "down",
    },
    {
      title: "Avg Fare",
      value: "-",
      change: "0%",
      icon: TrendingUp,
      trend: "up",
    },
  ]);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/hero-stats");
        const result = await response.json();

        if (result.stats) {
          setStats(
            result.stats.map((stat: any, index: number) => ({
              ...stat,
              icon: [Navigation, DollarSign, Wallet, TrendingUp][index],
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2 text-balance">
        Ride Analytics Dashboard
      </h1>
      <p className="text-muted-foreground mb-8">
        Track your transportation spending and travel patterns
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="overflow-hidden py-0">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    <p
                      className={`text-xs font-medium mt-2 ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change} vs last month
                    </p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
