"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable, type UserRow } from "@/components/users/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import axios from "@/utils/axios"
import { useEffect, useState } from "react"

type UserListResponse = {
  code?: number
  data?: UserRow[]
}

export default function Page() {

  const [users, setUsers] = useState<UserRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await axios.post<UserListResponse>('/user/get-list')
        const payload = response.data

        if (!isMounted) return

        if (payload?.code === 1 && Array.isArray(payload.data)) {
          setUsers(payload.data)
        } else {
          setUsers([])
          setErrorMessage('No users available right now.')
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage('Failed to fetch users. Please try again later.')
          setUsers([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
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
              {errorMessage && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}
              <DataTable data={users} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
