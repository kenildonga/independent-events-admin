"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/job-forms/data-table"
import { JobFormDialog } from "@/components/job-forms/job-form-dialog"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import axios from "@/utils/axios"
import Swal from "sweetalert2"

interface JobFormType {
  _id: string
  jobTitle: string
  companyName: string
  location: string
  jobType: string
  description: string
  salaryStart: number
  salaryEnd: number
  link: string
  isActive: boolean
  createdAt: string
}

interface ApiResponse {
  code: number
  message: string
  data: JobFormType[]
}

export default function Page() {
  const [data, setData] = useState<JobFormType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedJobForm, setSelectedJobForm] = useState<JobFormType | null>(null)

  const fetchData = async () => {
    try {
      const response = await axios.post<ApiResponse>('/other/job-form', {
        action: "get"
      })
      if (response.data.code === 1) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching job forms:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddJobForm = () => {
    setSelectedJobForm(null)
    setDialogOpen(true)
  }

  const handleEditJobForm = (jobForm: JobFormType) => {
    setSelectedJobForm(jobForm)
    setDialogOpen(true)
  }

  const handleDeleteJobForm = async (formId: string) => {
    const confirmResult = await Swal.fire({
      title: "Delete Job Form?",
      text: "Are you sure you want to delete this job form? This action cannot be undone.",
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
      const response = await axios.post<ApiResponse>("/other/job-form", {
        formId,
        action: "delete",
      })

      if (response.data.code === 1) {
        fetchData()
      } else {
        throw new Error(response.data.message || "Delete failed")
      }
    } catch (error: any) {
      console.error("Error deleting job form:", error)
      await Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete job form. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      })
    }
  }

  const handleStatusChange = async (formId: string, isActive: boolean) => {
    const action = isActive ? "active" : "inactive"

    try {
      const response = await axios.post<ApiResponse>("/other/job-form", {
        formId,
        action,
      })

      if (response.data.code === 1) {
        fetchData()
      } else {
        throw new Error(response.data.message || "Status change failed")
      }
    } catch (error: any) {
      console.error("Error changing job form status:", error)
      await Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change job form status. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      })
      // Revert the change
      fetchData()
    }
  }

  const handleFormSuccess = () => {
    fetchData()
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
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-green-700 border-green-300 hover:bg-green-50 hover:border-green-400 ml-6"
                  onClick={handleAddJobForm}
                >
                  Add New Job Form
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading job forms...</p>
                </div>
              ) : (
                <DataTable
                  data={data}
                  onEdit={handleEditJobForm}
                  onDelete={handleDeleteJobForm}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <JobFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        jobForm={selectedJobForm}
        onSuccess={handleFormSuccess}
      />
    </SidebarProvider>
  )
}
