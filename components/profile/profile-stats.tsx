import { Card } from "@/components/ui/card";
import { Wallet, TrendingUp, Zap } from "lucide-react";

interface ProfileStatsProps {
  user: {
    balance: string | null;
    totalSpent: string | null;
  };
}

export function ProfileStats({ user }: ProfileStatsProps) {
  const balance = Number.parseFloat(user.balance || "0");
  const totalSpent = Number.parseFloat(user.totalSpent || "0");

  const stats = [
    {
      label: "Current Balance",
      value: `₹${balance.toFixed(2)}`,
      icon: Wallet,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Spent",
      value: `₹${totalSpent.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Account Status",
      value: "Active",
      icon: Zap,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-2xl md:text-3xl font-bold mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
