"use client"

import * as React from "react"
import {
  IconEdit,
  IconTrash
} from "@tabler/icons-react"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useIsMobile } from "@/hooks/use-mobile"
import ShowSidebar from "./show-sidebar"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const schema = z.object({
  _id: z.string(),
  jobTitle: z.string(),
  companyName: z.string(),
  location: z.string(),
  jobType: z.string(),
  description: z.string(),
  salaryStart: z.number(),
  salaryEnd: z.number(),
  link: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
})

export type JobForm = z.infer<typeof schema>

export function DataTable({
  data: initialData,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  data: JobForm[]
  isLoading?: boolean
  onEdit?: (jobForm: JobForm) => void
  onDelete?: (formId: string) => void
  onStatusChange?: (formId: string, isActive: boolean) => void
}) {
  const [data, setData] = React.useState<JobForm[]>(initialData)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const updateStatus = (_id: string, isActive: boolean) => {
    setData(prev => prev.map(form => form._id === _id ? { ...form, isActive } : form))
    if (onStatusChange) {
      onStatusChange(_id, isActive)
    }
  }

  const columns: ColumnDef<JobForm>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableHiding: false,
    },
    {
      accessorKey: "companyName",
      header: "Company Name",
      enableHiding: false,
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
      enableHiding: false,
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "jobType",
      header: "Job Type",
    },
    {
      accessorKey: "salaryStart",
      header: "Salary Range",
      cell: ({ row }) => (
        <span>${row.original.salaryStart.toLocaleString()} - ${row.original.salaryEnd.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt)
        return date.toLocaleDateString()
      },
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => (
        <a
          href={row.original.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Apply Here
        </a>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"} className={row.original.isActive ? "bg-green-100 text-green-800 hover:bg-green-100/80" : "bg-red-100 text-red-800 hover:bg-red-100/80"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="justify-center flex items-center gap-2">
          <Switch
            checked={row.original.isActive}
            disabled={isLoading}
            onCheckedChange={(checked) => {
              updateStatus(row.original._id, checked)
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground bg-gray-200/50 hover:bg-gray-200/70"
            aria-label="Edit"
            onClick={() => onEdit && onEdit(row.original)}
          >
            <IconEdit />
            <span className="sr-only">Edit</span>
          </Button>
          <ShowSidebar item={row.original} isMobile={isMobile} />
          <Button 
            variant="destructive" 
            size="icon" 
            aria-label="Delete"
            onClick={() => onDelete && onDelete(row.original._id)}
          >
            <IconTrash />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row._id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (<div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
    <div className="flex items-center justify-between px-4">
      <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
        {data.length || 0} rows
      </div>
    </div>
  </div>)
}