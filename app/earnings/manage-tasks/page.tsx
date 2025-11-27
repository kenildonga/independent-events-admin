"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/earnings/manage-tasks/data-table"
import { TaskFormDialog } from "@/components/earnings/manage-tasks/task-form-dialog"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import axios from "@/utils/axios"
import Swal from "sweetalert2"

interface TaskType {
  _id: string
  taskName: string
  point: number
  question: string
  answer: string
  options: Record<string, string>
  isActive: boolean
}

interface ApiResponse {
  code: number
  message: string
  data: TaskType[]
}

export default function Page() {
  const [data, setData] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null)

  const fetchData = async () => {
    try {
      const response = await axios.get<ApiResponse>('/earn/get-daily-tasks')
      if (response.data.code === 1) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddTask = () => {
    setSelectedTask(null)
    setDialogOpen(true)
  }

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task)
    setDialogOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    const confirmResult = await Swal.fire({
      title: "Delete Task?",
      text: "Are you sure you want to delete this task? This action cannot be undone.",
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
      const response = await axios.post<ApiResponse>("/earn/action-daily-tasks", {
        taskId,
        action: "delete",
      })

      if (response.data.code === 1) {
        fetchData()
      } else {
        throw new Error(response.data.message || "Delete failed")
      }
    } catch (error: any) {
      console.error("Error deleting task:", error)
      await Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to delete task. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      })
    }
  }

  const handleStatusChange = async (taskId: string, isActive: boolean) => {
    const action = isActive ? "active" : "inactive"

    try {
      const response = await axios.post<ApiResponse>("/earn/action-daily-tasks", {
        taskId,
        action,
      })

      if (response.data.code === 1) {
        fetchData()
      } else {
        throw new Error(response.data.message || "Status change failed")
      }
    } catch (error: any) {
      console.error("Error changing task status:", error)
      await Swal.fire({
        title: "Error!",
        text:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change task status. Please try again.",
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
                  onClick={handleAddTask}
                >
                  Add New Task
                </Button>
              </div>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading tasks...</p>
                </div>
              ) : (
                <DataTable
                  data={data}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          </div>
        </div>
      </SidebarInset>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={selectedTask}
        onSuccess={handleFormSuccess}
      />
    </SidebarProvider>
  )
}
