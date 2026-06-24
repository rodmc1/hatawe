"use client"

import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Image from "next/image"
import { LayoutDashboardIcon, UsersIcon, TrophyIcon, ListOrderedIcon, SendIcon } from "lucide-react"

const data = {
  user: {
    name: "Rodney Cunanan",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <LayoutDashboardIcon
        />
      ),
      isActive: true,
    },
    {
      title: "Players",
      url: "#",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Rankings",
      url: "#",
      icon: (
        <TrophyIcon
        />
      ),
    },
    {
      title: "Queue",
      url: "#",
      icon: (
        <ListOrderedIcon
        />
      )
    },
  ],
  navSecondary: [
    {
      title: "Feedback",
      url: "#",
      icon: (
        <SendIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="#" />} className="py-3 h-auto">
              <Image
                src="/hatawe-logo.jpg"
                alt="Hatawe Logo"
                width={160}
                height={48}
                className="h-12 w-auto object-contain"
                priority
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
