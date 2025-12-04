"use client"
import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { IconCoins } from "@tabler/icons-react"
import ShowSidebar from "@/components/users/show-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

export const schema = z.object({
  _id: z.string(),
  referrerUserId: z.string(),
  referrerName: z.string(),
  referredUserId: z.string(),
  referredUserName: z.string(),
  pointsEarned: z.number(),
  joinedAt: z.string(),
})

function ReferrerNameCell({ userId, userName }: { userId: string; userName: string }) {
  const isMobile = useIsMobile()

  return (
    <ShowSidebar userId={userId} isMobile={isMobile} fallbackName={userName} />
  )
}

function ReferredUserNameCell({ userId, userName }: { userId: string; userName: string }) {
  const isMobile = useIsMobile()

  return (
    <ShowSidebar userId={userId} isMobile={isMobile} fallbackName={userName} />
  )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "rowNumber",
    header: "#",
    cell: ({ row }) => row.index + 1,
    enableHiding: false,
  },
  {
    accessorKey: "referrerName",
    header: "Referrer Name",
    cell: ({ row }) => (
      <ReferrerNameCell userId={row.original.referrerUserId} userName={row.original.referrerName} />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "referredUserName",
    header: "Referred User Name",
    cell: ({ row }) => (
      <ReferredUserNameCell userId={row.original.referredUserId} userName={row.original.referredUserName} />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "pointsEarned",
    header: "Points Earned",
    cell: ({ row }) => row.original.pointsEarned,
    enableHiding: false,
  },
  {
    accessorKey: "joinedAt",
    header: "Joined At",
    cell: ({ row }) => row.original.joinedAt,
  },
]

export function DataTable({
  data,
  loading = false,
}: {
  data: z.infer<typeof schema>[]
  loading?: boolean
}) {

  const table = useReactTable({
    data,
    columns,
    getRowId: row => row._id,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const rowModel = table.getRowModel()

  return (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
      <div className="items-center gap-2">
        <p className="flex text-green-700 border-green-300">
          Point Value is &nbsp;<IconCoins />1 = &#8377;0.50
        </p>
      </div>
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
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : rowModel.rows?.length ? (
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
}