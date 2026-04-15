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
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

const data = {
  user: {
    name: 'Rodney Cunanan',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: <TerminalSquareIcon />,
      isActive: true
    },
    {
      title: 'Clubs',
      url: '#',
      icon: <BotIcon />
    },
    {
      title: 'Queuing',
      url: '#',
      icon: <BookOpenIcon />
    },
    {
      title: 'Tournaments',
      url: '#',
      icon: <Settings2Icon />
    },
    {
      title: 'Rankings',
      url: '#',
      icon: <Settings2Icon />
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  <span className="text-xs text-gray-400 truncate">Badminton Club</span>
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
