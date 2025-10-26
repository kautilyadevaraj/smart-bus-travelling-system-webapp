"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Bus, TrendingUp, CreditCard } from "lucide-react";
import Login from "@/components/login";

const chartData = [
  { day: "Mon", amount: 240 },
  { day: "Tue", amount: 320 },
  { day: "Wed", amount: 280 },
  { day: "Thu", amount: 350 },
  { day: "Fri", amount: 410 },
  { day: "Sat", amount: 290 },
  { day: "Sun", amount: 180 },
];

const recentRides = [
  {
    id: 1,
    route: "Central Station → Airport",
    date: "2024-10-25",
    fare: "₹125",
  },
  { id: 2, route: "Downtown → Mall", date: "2024-10-24", fare: "₹85" },
  { id: 3, route: "University → Station", date: "2024-10-23", fare: "₹95" },
];

export default function Dashboard() {
  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>
      <Login/>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Spent (Oct)
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₹1,450
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Total Rides
            </CardTitle>
            <Bus className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">32</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Avg. Fare
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₹45.31
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">
              Card Balance
            </CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              ₹312.50
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Spending Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Weekly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    color: "var(--card-foreground)",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="var(--chart-1)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Rides */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Rides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentRides.map((ride) => (
              <div
                key={ride.id}
                className="pb-4 border-b border-border last:border-0"
              >
                <p className="text-sm font-medium text-card-foreground">
                  {ride.route}
                </p>
                <p className="text-xs text-muted-foreground">{ride.date}</p>
                <p className="text-sm font-semibold text-card-foreground mt-1">
                  {ride.fare}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
