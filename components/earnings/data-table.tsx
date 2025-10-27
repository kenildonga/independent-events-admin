"use client"

import * as React from "react"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table"

import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export const schema = z.object({
  id: z.number(),
  username: z.string(),
  type: z.enum(["credit", "debit"]),
  datetime: z.string(),
  points: z.number(),
})

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return row.original.id
    },
    enableHiding: false,
  },
  {
    accessorKey: "username",
    header: "User name",
    cell: ({ row }) => row.original.username,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        className={
          "capitalize px-2 " +
          (row.original.type === "credit"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
            : "bg-rose-50 text-rose-600 dark:bg-rose-900 dark:text-rose-400")
        }
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "datetime",
    header: "Date",
    cell: ({ row }) => {
      const formatter = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
      return formatter.format(new Date(row.original.datetime))
    },
  },
  {
    accessorKey: "points",
    header: () => <div className="text-right">Points</div>,
    cell: ({ row }) => {
      const isCredit = row.original.type === "credit"
      const formattedPoints = `${isCredit ? "+" : "-"}${Math.abs(row.original.points)}`

      return (
        <div
          className={
            "text-right font-medium " +
            (isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
          }
        >
          {formattedPoints}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground bg-gray-200/50 hover:bg-gray-200/70"
        >
          <IconPencil />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="destructive"
          size="icon"
        >
          <IconTrash />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    ),
  },
]

function TableRowComponent({ row }: { row: Row<z.infer<typeof schema>> }) {
  return (
    <TableRow data-state={row.getIsSelected() && "selected"}>
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [tabValue, setTabValue] = React.useState<"all" | "credit" | "debit">(
    "all"
  )
  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  React.useEffect(() => {
    const typeColumn = table.getColumn("type")
    if (!typeColumn) return
    if (tabValue === "all") {
      typeColumn.setFilterValue(undefined)
      return
    }
    typeColumn.setFilterValue(tabValue)
  }, [tabValue, table])

  const totals = React.useMemo(() => {
    return data.reduce(
      (acc, item) => {
        acc.all += 1
        acc[item.type] += 1
        return acc
      },
      { all: 0, credit: 0, debit: 0 }
    )
  }, [data])

  const rowModel = table.getRowModel()

  const renderTable = () => (
    <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
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
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {rowModel.rows?.length ? (
              rowModel.rows.map((row) => (
                <TableRowComponent key={row.id} row={row} />
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
          {table.getFilteredSelectedRowModel().rows.length} of {" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {" "}
            {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <Tabs
      value={tabValue}
      onValueChange={(value) => setTabValue(value as typeof tabValue)}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="type-selector" className="sr-only">
          Type
        </Label>
        <Select
          value={tabValue}
          onValueChange={(value: "all" | "credit" | "debit") =>
            setTabValue(value)
          }
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="type-selector"
          >
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">
            All <Badge variant="secondary">{totals.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="credit">
            Credit <Badge variant="secondary">{totals.credit}</Badge>
          </TabsTrigger>
          <TabsTrigger value="debit">
            Debit <Badge variant="secondary">{totals.debit}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex flex-col">
        {renderTable()}
      </TabsContent>
      <TabsContent value="credit" className="flex flex-col">
        {renderTable()}
      </TabsContent>
      <TabsContent value="debit" className="flex flex-col">
        {renderTable()}
      </TabsContent>
    </Tabs>
  )
}