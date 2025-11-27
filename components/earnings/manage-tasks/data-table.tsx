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
  taskName: z.string(),
  point: z.number(),
  question: z.string(),
  answer: z.string(),
  options: z.object().catchall(z.string()),
  isActive: z.boolean(),
});

export type Task = z.infer<typeof schema>

export function DataTable({
  data: initialData,
  isLoading = false,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  data: Task[]
  isLoading?: boolean
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onStatusChange?: (taskId: string, isActive: boolean) => void
}) {
  const [data, setData] = React.useState<Task[]>(initialData)

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const updateStatus = (_id: string, isActive: boolean) => {
    setData(prev => prev.map(task => task._id === _id ? { ...task, isActive } : task))
    if (onStatusChange) {
      onStatusChange(_id, isActive)
    }
  }

  const columns: ColumnDef<Task>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableHiding: false,
    },
    {
      accessorKey: "taskName",
      header: "Task Name",
      enableHiding: false,
    },
    {
      accessorKey: "point",
      header: "Points",
    },
    {
      accessorKey: "question",
      header: "Question",
      enableHiding: false,
    },
    {
      accessorKey: "options",
      header: "Options",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {Object.entries(row.original.options).map(([key, value]) => (
            <span key={key} className="text-xs whitespace-nowrap">
              <span className="font-semibold">{key}:</span> {value}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "answer",
      header: "Answer",
      cell: ({ row }) => <p>{row.original.answer}</p>,
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