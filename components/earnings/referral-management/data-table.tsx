"use client"

import * as React from "react"
import {
  IconPlus
} from "@tabler/icons-react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export const schema = z.object({
  _id: z.number(),
  userName: z.string(),
  referralCode: z.string(),
  referredUsers: z.number(),
  totalEarnings: z.number(),
})

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return row.original._id
    },
    enableHiding: false,
  },
  {
    accessorKey: "userName",
    header: "User name",
    cell: ({ row }) => row.original.userName,
    enableHiding: false,
  },
  {
    accessorKey: "referralCode",
    header: "Referral Code",
    cell: ({ row }) => row.original.referralCode,
    enableHiding: false,
  },
  {
    accessorKey: "referredUsers",
    header: "Referred Users",
    cell: ({ row }) => row.original.referredUsers,
    enableHiding: false,
  },
  {
    accessorKey: "totalEarnings",
    header: "Total Earnings",
    cell: ({ row }) => row.original.totalEarnings,
  },
]

export function DataTable({
  data,
}: {
  data: z.infer<typeof schema>[]
}) {

  const table = useReactTable({
    data,
    columns,
    getRowId: row => row._id.toString(),
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowModel = table.getRowModel()

  const renderTable = () => (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
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
            {rowModel.rows?.length ? (
              rowModel.rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between px-4 lg:px-6 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <IconPlus />
            <span className="hidden lg:inline">Add Entry</span>
            <span className="lg:hidden">Add</span>
          </Button>
        </div>
      </div>
      {renderTable()}
    </div>
  )
}