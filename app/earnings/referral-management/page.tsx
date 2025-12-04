"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/earnings/referral-management/data-table"
import { SectionCards } from "@/components/earnings/referral-management/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import axiosInstance from "@/utils/axios"

type ReferralRow = {
  _id: string
  referrerUserId: string
  referrerName: string
  referredUserId: string
  referredUserName: string
  pointsEarned: number
  joinedAt: string
}

type ApiResponse = {
  code: number
  message: string
  data?: ReferralRow[]
}

export default function Page() {
  const [data, setData] = useState<ReferralRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReferralHistory = async () => {
      try {
        setLoading(true)
        const response = await axiosInstance.post<ApiResponse>('earn/get-referral-history')

        if (response.data.code === 1) {
          setData(response.data.data || [])
        } else {
          setData([])
        }
      } catch (error) {
        console.error('Error fetching referral history:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchReferralHistory()
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
