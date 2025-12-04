"use client"

import * as React from "react"
import {
  IconTrash,
  IconEye
} from "@tabler/icons-react"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { z } from "zod"
import { Button } from "@/components/ui/button"
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

import dayjs from "dayjs";

export const schema = z.object({
  _id: z.string(),
  userId: z.string().nullable(),
  fullName: z.string(),
  lastName: z.string(),
  email: z.string(),
  subject: z.string(),
  message: z.string(),
  createdAt: z.string(),
})

export type Contact = z.infer<typeof schema>

export function DataTable({
  data: initialData,
  isLoading = false,
  onDelete,
}: {
  data: Contact[]
  isLoading?: boolean
  onDelete?: (contactId: string) => void
}) {
  const [data, setData] = React.useState<Contact[]>(initialData)
  const isMobile = useIsMobile()

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  const columns: ColumnDef<Contact>[] = [
    {
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => row.index + 1,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
      cell: ({ row }) => {
        return `${row.original.fullName} ${row.original.lastName}`
      },
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "Email",
      enableHiding: false,
    },
    {
      accessorKey: "subject",
      header: "Subject",
    },
    {
      accessorKey: "createdAt",
      header: "Date & Time",
      cell: ({ row }) => dayjs(row.original.createdAt).format("YYYY-MM-DD hh:mm A"),
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <div className="justify-center flex items-center gap-2">
          <ShowSidebar item={row.original} isMobile={isMobile} />
          <Button 
            variant="destructive" 
            size="icon" 
            aria-label="Delete"
            onClick={() => onDelete && onDelete(row.original._id)}
            disabled={isLoading}
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