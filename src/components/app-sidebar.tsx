"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  TrendingUp,
  Eye,
  BarChart3,
  Trophy,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: "admin" | "power_user" | "user" | "viewer";
}

interface AppSidebarProps {
  user: User;
}

const navigationItems = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        title: "Targets",
        href: "/targets",
        icon: <Target className="w-4 h-4" />,
      },
      {
        title: "Portfolio",
        href: "/portfolio",
        icon: <TrendingUp className="w-4 h-4" />,
        badge: "Soon",
      },
      {
        title: "Watchlist",
        href: "/watchlist",
        icon: <Eye className="w-4 h-4" />,
      },
      {
        title: "History",
        href: "/history",
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        icon: <Trophy className="w-4 h-4" />,
        badge: "Soon",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: <Settings className="w-4 h-4" />,
      },
    ],
  },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-primary-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Outvestments</span>
            <span className="text-xs text-muted-foreground">Paper Trading</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href}>
                        {item.icon}
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-3 py-2">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="text-sm font-medium truncate">{user.name || user.email}</div>
          <Badge variant="outline" className="mt-1 text-xs capitalize">
            {user.role.replace("_", " ")}
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
