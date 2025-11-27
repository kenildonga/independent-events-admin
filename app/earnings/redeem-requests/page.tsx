"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/earnings/redeem-requests/data-table"
import { SectionCards } from "@/components/earnings/redeem-requests/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  IconCoins
} from "@tabler/icons-react"
import axiosInstance from "@/utils/axios"

type RedeemStatus = "all" | "approved" | "pending" | "rejected"

interface RedeemItem {
  _id: string
  userId?: string
  userName: string
  points: number
  totalValue: number
  status: "approved" | "pending" | "rejected"
  createdAt: string
  conversionRate: number
  statusUpdatedAt?: string
}

interface RedeemApiResponse {
  code: number
  message: string
  data: RedeemItem[]
}

export default function Page() {
  const [data, setData] = React.useState<RedeemItem[]>([])
  const [filter, setFilter] = React.useState<RedeemStatus>("all")

  const fetchData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.post<RedeemApiResponse>('earn/get-redeem-history', {
        filter: filter
      })
      if (response.data.code === 1) {
        setData(response.data.data)
      } else if (response.data.code === 2) {
        setData([])
      }
    } catch (error) {
      console.error("Failed to fetch data", error)
    }
  }, [filter])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <Tabs defaultValue="all" value={filter} onValueChange={(val) => setFilter(val as RedeemStatus)}>
                <div className="px-4 md:px-6">
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </div>
                <div className="flex items-center justify-between px-4 lg:px-6">
                  <div className="items-center gap-2">
                    <p className="flex text-green-700 border-green-300">
                      Point Value is &nbsp;<IconCoins />1 = &#8377;0.50
                    </p>
                  </div>
                </div>
                <DataTable data={data} />
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
