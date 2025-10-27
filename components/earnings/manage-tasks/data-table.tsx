"use client"

import * as React from "react"
import {
  IconCheck,
  IconX
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
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
  updatedAt: z.string(),
});

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <p>{row.original._id}</p>
    },
    enableHiding: false,
  },
  {
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => row.original.question,
    enableHiding: false,
  },
  {
    accessorKey: "updatedAt",
    header: "Last Updated",
    cell: ({ row }) => {
      const formatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
      return formatter.format(new Date(row.original.updatedAt))
    },
  },
  {
    accessorKey: "options",
    header: "Options",
    cell: ({ row }) => (
      <div>
        {row.original.options.map((option, index) => (
          <p key={index}>{option}</p>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "answer",
    header: () => <div className="text-center">Redeem Points</div>,
    cell: ({ row }) => <p className="text-center">{row.original.answer}</p>,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: () => (
      <div className="justify-center flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground bg-gray-200/50 hover:bg-gray-200/70"
        >
          <IconCheck />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="destructive"
          size="icon"
        >
          <IconX />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    ),
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
    getRowId: (row) => row._id.toString(),
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