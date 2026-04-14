'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';

const data = {
  user: {
    name: 'Rodney Cunanan',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Playground',
      url: '#',
      icon: <TerminalSquareIcon />,
      isActive: true
    },
    {
      title: 'Models',
      url: '#',
      icon: <BotIcon />
    },
    {
      title: 'Documentation',
      url: '#',
      icon: <BookOpenIcon />
    },
    {
      title: 'Settings',
      url: '#',
      icon: <Settings2Icon />
    }
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const reducedMotion = useReducedMotion();
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="px-3 py-2 border-b border-gray-200 flex items-center gap-1.5 hover:bg-gray-50 transition-colors">
          <Image src="/assets/hatawe.jpg" alt="Hatawe" width={50} height={50} className="object-contain h-auto" />
          <div className="flex flex-col italic">
            <motion.span
              className="text-lg font-bold leading-tight"
              animate={reducedMotion ? undefined : { color: ['#111827', '#6366f1', '#ef4444', '#111827'] }}
              transition={{ color: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 2 } }}
              style={reducedMotion ? { color: '#111827' } : undefined}>
              Hatawe
            </motion.span>
            <span className="text-xs text-gray-400">Badminton Club</span>
          </div>
        </Link>
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
