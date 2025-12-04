"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/contacts/data-table"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import axios from "@/utils/axios"
import Swal from "sweetalert2"

interface ContactType {
  _id: string
  userId: string | null
  fullName: string
  lastName: string
  email: string
  subject: string
  message: string
  createdAt: string
}

interface ApiResponse {
  code: number
  message: string
  data: ContactType[]
}

export default function Page() {
  const [data, setData] = useState<ContactType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('/other/contact')
      if (response.data.code === 1) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteContact = async (contactId: string) => {
    const confirmResult = await Swal.fire({
      title: "Delete Contact?",
      text: "Are you sure you want to delete this contact? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    })

    if (!confirmResult.isConfirmed) {
      return
    }

    try {
      const response = await axios.post<ApiResponse>("/other/contact", {
        contactId,
      })

      if (response.data.code === 1) {
        await Swal.fire({
          title: "Deleted!",
          text: response.data.message || "Contact deleted successfully.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        })
        fetchData()
      } else {
        throw new Error(response.data.message || "Delete failed")
      }
    } catch (error: any) {
      console.error("Error deleting contact:", error)
      await Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete contact. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      })
    }
  }

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
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading contacts...</p>
                </div>
              ) : (
                <DataTable
                  data={data}
                  onDelete={handleDeleteContact}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
