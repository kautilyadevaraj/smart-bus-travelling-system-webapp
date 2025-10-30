"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  History,
  User,
  Settings,
  LogOut,
  CreditCard,
  ChevronLeft,
} from "lucide-react";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/ride-history", label: "Ride History", icon: History },
    { href: "/smart-card", label: "Smart Card", icon: CreditCard },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-sidebar-foreground">
            SmartRide
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <ChevronLeft
            className={`w-5 h-5 text-sidebar-foreground transition-transform duration-300 ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full transition-all duration-300 ${
                  isCollapsed ? "justify-center p-2" : "justify-start gap-3"
                } ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5" />
                {!isCollapsed && <span>{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className={`w-full transition-all duration-300 ${
            isCollapsed ? "justify-center p-2" : "justify-start gap-3"
          } text-sidebar-foreground hover:bg-sidebar-accent`}
          title={isCollapsed ? "Log Out" : ""}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Log Out</span>}
        </Button>
      </div>
    </aside>
  );
}
