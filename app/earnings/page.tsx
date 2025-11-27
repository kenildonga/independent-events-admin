"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/earnings/data-table"
import { SectionCards } from "@/components/earnings/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import apiClient from "@/utils/axios"

interface ApiPointItem {
    _id: string
    userId?: string
    userName: string
    pointsChange: number
    type: "credit" | "debit"
    note: string
    relatedPrimaryIdType?: string
    relatedPrimaryId?: string
    createdAt: string
}

interface ApiPointListResponse {
    code: number
    message: string
    data: ApiPointItem[]
}

export default function Page() {
  const [data, setData] = React.useState<ApiPointItem[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.post<ApiPointListResponse>('/earn/get-point-list')
        if (response.data && response.data.code === 1) {
             setData(response.data.data)
        }
      } catch (error) {
        console.error("Failed to fetch points history", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
              {loading ? (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">Loading...</div>
              ) : (
                  <DataTable data={data} />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
