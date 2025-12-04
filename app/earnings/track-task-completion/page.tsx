"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/earnings/track-task-completion/data-table"
import { SectionCards } from "@/components/earnings/track-task-completion/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import axiosInstance from "@/utils/axios"

type TaskComplete = {
  _id: string
  userId: string
  userName: string
  pointsEarned: number
  completedAt: string
}

type ApiResponse = {
  code: number
  message: string
  data?: TaskComplete[]
}

export default function Page() {
  const [data, setData] = useState<TaskComplete[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.post<ApiResponse>('/earn/get-task-completion-history')
        const responseData = response.data as ApiResponse
        
        if (responseData.code === 1 && responseData.data) {
          setData(responseData.data)
        } else if (responseData.code === 2) {
          setData([])
        }
      } catch (error: any) {
        setData([])
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
              <DataTable data={data} loading={loading} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
