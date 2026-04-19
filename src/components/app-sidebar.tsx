'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail
} from '@/components/ui/sidebar';
import { LayoutDashboardIcon, UsersIcon, ListOrderedIcon, TrophyIcon, BarChart2Icon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: <LayoutDashboardIcon />,
      isActive: true
    },
    {
      title: 'Clubs',
      url: '/clubs',
      icon: <UsersIcon />
    },
    {
      title: 'Queuing',
      url: '/queuing',
      icon: <ListOrderedIcon />
    },
    {
      title: 'Tournaments',
      url: '/tournaments',
      icon: <TrophyIcon />
    },
    {
      title: 'Rankings',
      url: '/rankings',
      icon: <BarChart2Icon />
    }
  ]
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: { name: string; email: string; avatar: string };
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" size="lg">
              <Link href="/">
                <Image
                  src="/assets/hatawe.jpg"
                  alt="Hatawe"
                  width={32}
                  height={32}
                  className="shrink-0 object-contain rounded-sm"
                />
                <div className="flex flex-col italic overflow-hidden">
                  <motion.span
                    className="text-sm font-bold leading-tight truncate"
                    animate={reducedMotion ? undefined : { color: ['#111827', '#6366f1', '#ef4444', '#111827'] }}
                    transition={{ color: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
                    style={reducedMotion ? { color: '#111827' } : undefined}>
                    Hatawe
                  </motion.span>
                  <span className="text-xs text-gray-400 truncate">Badminton</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
