"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  History,
  User,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ride-history", label: "Ride History", icon: History },
  { href: "/smart-card", label: "Smart Card", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border-b border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl font-bold text-sidebar-foreground">SmartRide</h1>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-sidebar-accent rounded-lg">
              <Menu className="w-6 h-6 text-sidebar-foreground" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <SheetHeader className="border-b border-sidebar-border p-4">
              <SheetTitle className="text-sidebar-foreground">Menu</SheetTitle>
            </SheetHeader>
            <SidebarMenu className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href} onClick={() => setIsOpen(false)}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <LogOut />
                    <span>Log Out</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
