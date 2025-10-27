"use client"

import * as React from "react"

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCheck,
  IconX
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
  datetime: z.string(),
  convertRate: z.number(),
  status: z.enum(["approved", "pending", "rejected"]),
  points: z.number(),
});

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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={
          "capitalize px-2 " +
          (row.original.status === "approved"
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
            : row.original.status === "pending"
              ? "bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
              : "bg-rose-50 text-rose-600 dark:bg-rose-900 dark:text-rose-400")
        }
      >
        {row.original.status}
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
    header: () => <div className="text-center">Redeem Points</div>,
    cell: ({ row }) => {
      const isCredit = row.original.status === "rejected"
      const formattedPoints = `${isCredit ? "+" : "-"}${Math.abs(row.original.points)}`

      return (
        <div
          className={
            "text-center font-medium " +
            (isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")
          }
        >
          {formattedPoints}
        </div>
      )
    },
  },
  {
    accessorKey: "convertRate",
    header: () => <div className="text-center">Converted Value</div>,
    cell: ({ row }) => <p className="text-center">&#8377;{row.original.convertRate}</p>,
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

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
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

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const [tabValue, setTabValue] = React.useState<"all" | "pending" | "approved" | "rejected">(
    "all"
  )

  const sortableId = React.useId()

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  React.useEffect(() => {
    const typeColumn = table.getColumn("status")
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
        acc[item.status] += 1
        return acc
      },
      { all: 0, approved: 0, pending: 0, rejected: 0 }
    )
  }, [data])

  const rowModel = table.getRowModel()
  const visibleRowIds = rowModel.rows.map((row) => row.original.id)

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
              <SortableContext
                items={visibleRowIds}
                strategy={verticalListSortingStrategy}
              >
                {rowModel.rows.map((row) => (
                  <DraggableRow key={row.id} row={row} />
                ))}
              </SortableContext>
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
        <Label htmlFor="status-selector" className="sr-only">
          Status
        </Label>
        <Select
          value={tabValue}
          onValueChange={(value: "all" | "pending" | "approved" | "rejected") =>
            setTabValue(value)
          }
        >
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="status-selector"
          >
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">
            All <Badge variant="secondary">{totals.all}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending <Badge variant="secondary">{totals.pending}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved <Badge variant="secondary">{totals.approved}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected <Badge variant="secondary">{totals.rejected}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all" className="flex flex-col">
        {renderTable()}
      </TabsContent>
      <TabsContent value="pending" className="flex flex-col">
        {renderTable()}
      </TabsContent>
      <TabsContent value="approved" className="flex flex-col">
        {renderTable()}
      </TabsContent>
      <TabsContent value="rejected" className="flex flex-col">
        {renderTable()}
      </TabsContent>
    </Tabs>
  )
}