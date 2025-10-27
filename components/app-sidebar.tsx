"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileDescription,
  IconReport,
  IconBolt,
  IconSettings,
  IconUsers,
  IconCalendarEvent,
  IconMessageCircle,
  IconRss,
  IconBell,
  IconAddressBook,
  IconGitBranch,
  IconPhoto,
  IconWindow,
  IconBriefcase2,
  IconCoins,
  IconChartBar
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Events",
      url: "/events",
      icon: IconCalendarEvent,
    },
    {
      title: "Reporting & Attendance",
      url: "/reporting",
      icon: IconReport,
    },
    {
      title: "Chat",
      url: "/chat",
      icon: IconMessageCircle,
    },
    {
      title: "Channels",
      url: "/channels",
      icon: IconRss,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: IconBell,
    },
    {
      title: "Earnings & Rewards",
      url: "/earnings",
      icon: IconCoins,
      items: [
        {
          title: "Redeem Requests",
          url: "/earnings/redeem-requests",
        },
        {
          title: "Manage Tasks",
          url: "/earnings/manage-tasks",
        },
        {
          title: "Track Task Completion",
          url: "#",
        },
        {
          title: "Referral Points",
          url: "/earnings/referral-management",
        },
      ],
    },
    {
      title: "Ranking & Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Job Management",
      url: "#",
      icon: IconBriefcase2,
    },
    {
      title: "Contacts",
      url: "#",
      icon: IconAddressBook,
    }
  ],
  navSecondary: [
    {
      title: "App Settings",
      url: "#",
      icon: IconSettings,
      items: [
        {
          title: "Version Control",
          url: "#",
          icon: IconGitBranch,
        },
        {
          title: "Home Screen Banners",
          url: "#",
          icon: IconPhoto,
        },
        {
          title: "Startup Popups",
          url: "#",
          icon: IconWindow,
        }
      ],
    },
    {
      title: "Pages",
      url: "#",
      icon: IconFileDescription,
      items: [
        {
          title: "Privacy Policy",
          url: "#",
          icon: IconFileDescription,
        },
        {
          title: "Terms of Service",
          url: "#",
          icon: IconFileDescription,
        }
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconBolt className="!size-5" />
                <span className="text-base font-semibold">Independent events</span>
              </a>
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
