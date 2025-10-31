import type React from "react";
import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MobileNav } from "@/components/mobile-nav";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

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
    <html lang="en" suppressHydrationWarning>
      <body className={` ${figtree.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Desktop: SidebarProvider with AppSidebar */}
          <SidebarProvider className="hidden md:flex">
            <AppSidebar />
            <div className="absolute top-3 right-3 z-50">
              <AnimatedThemeToggler />
            </div>
            <main className="flex-1 overflow-auto w-full">{children}</main>
          </SidebarProvider>

          {/* Mobile: MobileNav only */}
          <div className="md:hidden flex flex-col h-screen">
            <MobileNav />

            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
