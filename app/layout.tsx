import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SmartRide Bus Dashboard",
  description: "Smart bus transportation management system",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* Desktop: SidebarProvider with AppSidebar */}
        <SidebarProvider className="hidden md:flex">
          <AppSidebar />
          <main className="flex-1 overflow-auto w-full">{children}</main>
        </SidebarProvider>

        {/* Mobile: MobileNav only */}
        <div className="md:hidden flex flex-col h-screen">
            <MobileNav />

          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
