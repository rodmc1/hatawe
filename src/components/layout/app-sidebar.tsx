"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

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
import { UsersIcon, ListOrderedIcon, TrophyIcon, CalendarDaysIcon } from "lucide-react"

const data = {
  user: {
    name: "Rodney Cunanan",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Players",
      url: "/players",
      icon: <UsersIcon />,
    },
    {
      title: "Queue",
      url: "/queue",
      icon: <ListOrderedIcon />,
    },
    {
      title: "Rankings",
      url: "/rankings",
      icon: <TrophyIcon />,
      disabled: true,
    },
    {
      title: "Tournaments",
      url: "/tournaments",
      icon: <CalendarDaysIcon />,
      disabled: true,
    },
  ],
  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const items = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/dashboard" />} className="py-3 h-auto">
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
        <NavMain items={items} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
