"use client"

import * as React from "react"

import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconLoader2,
    IconSearch,
} from "@tabler/icons-react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { z } from "zod"
import ShowSidebar from "./show-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"

export const schema = z.object({
    _id: z.string(),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    profilePic: z.string(),
    createdAt: z.string(),
    isActive: z.boolean().optional(),
});

export type UserRow = z.infer<typeof schema>

export function DataTable({
    data: initialData,
    isLoading = false,
}: {
    data: UserRow[]
    isLoading?: boolean
}) {

    const [data, setData] = React.useState(() => initialData)

    React.useEffect(() => {
        setData(initialData)
    }, [initialData])

    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [activeTab, setActiveTab] = React.useState("all")
    const [globalFilter, setGlobalFilter] = React.useState("")

    const resolveIsActive = React.useCallback((user: UserRow) => {
        if (typeof user.isActive === "boolean") {
            return user.isActive
        }
        const legacyStatus = (user as { status?: string }).status
        return legacyStatus === "active"
    }, [])

    // Calculate counts for active/inactive states
    const statusCounts = React.useMemo(() => {
        const counts = { active: 0, inactive: 0 }
        data.forEach(user => {
            if (resolveIsActive(user)) counts.active++
            else counts.inactive++
        })
        return counts
    }, [data, resolveIsActive])

    // Filter data based on active tab
    const filteredData = React.useMemo(() => {
        if (activeTab === "all") return data
        if (activeTab === "active") return data.filter((item) => resolveIsActive(item))
        if (activeTab === "inactive") return data.filter((item) => !resolveIsActive(item))
        return data
    }, [data, activeTab, resolveIsActive])

    const updateStatus = (_id: string, isActive: boolean) => {
        setData(prev => prev.map(user => user._id === _id ? { ...user, isActive } : user))
    }

    const columns: ColumnDef<UserRow>[] = [
        {
            id: "rowNumber",
            header: "#",
            cell: ({ row }) => (
                <div className="text-muted-foreground text-sm font-medium w-7 text-center">
                    {row.index + 1}
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "profilePic",
            header: "Profile",
            cell: ({ row }) => (
                <div className="flex justify-start">
                    <img
                        src={row.original.profilePic}
                        alt={row.original.name}
                        className="size-8 rounded-full"
                    />
                </div>
            ),
            enableHiding: true,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return (
                    <TableCellViewer userId={row.original._id} name={row.original.name} />
                )
            },
            enableHiding: false,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <div className="w-48">
                    {row.original.email}
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => (
                <div className="w-32">
                    {row.original.phone}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Join Date",
            cell: ({ row }) => (
                <div className="w-36">
                    {(() => {
                        const rawDate = row.original.createdAt || (row.original as { joinDate?: string }).joinDate
                        if (!rawDate) return "-"
                        const date = new Date(rawDate)
                        return isNaN(date.getTime()) ? rawDate : date.toLocaleDateString()
                    })()}
                </div>
            ),
        },
        {
            id: "status",
            header: "Status",
            cell: ({ row }) => {
                const isActive = resolveIsActive(row.original)
                return (
                    <div className="space-y-1">
                        <Badge
                            variant="outline"
                            className={`px-1.5 ${isActive
                                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700"
                                    : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700"
                                }`}
                        >
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                )
            },
        },
        {
            id: "toggle",
            header: "Toggle",
            cell: ({ row }) => {
                const isActive = resolveIsActive(row.original)
                return (
                    <Switch
                        checked={isActive}
                        disabled={isLoading}
                        onCheckedChange={(checked) => {
                            updateStatus(row.original._id, !!checked)
                        }}
                    />
                )
            },
        },
    ]

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            pagination,
            globalFilter,
        },
        getRowId: (row) => row._id,
        enableRowSelection: true,
        onPaginationChange: setPagination,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    function renderTableContent() {
        return (
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-32 text-center"
                                >
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                        <IconLoader2 className="size-5 animate-spin" />
                                        <span>Loading users…</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
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
        )
    }

    return (
        <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <Select value={activeTab} onValueChange={setActiveTab}>
                    <SelectTrigger
                        className="flex w-fit @4xl/main:hidden"
                        size="sm"
                        id="view-selector"
                    >
                        <SelectValue placeholder="Select a view" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active Users</SelectItem>
                        <SelectItem value="inactive">Inactive Users</SelectItem>
                    </SelectContent>
                </Select>
                <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
                    <TabsTrigger value="all">All Users</TabsTrigger>
                    <TabsTrigger value="active">
                        Active <Badge variant="secondary">{statusCounts.active}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="inactive">
                        Inactive <Badge variant="secondary">{statusCounts.inactive}</Badge>
                    </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    {/* <Button variant="outline" size="sm">
                        <IconPlus />
                        <span className="hidden lg:inline">Add User</span>
                    </Button> */}
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 lg:px-6">
                <div className="relative flex-1 max-w-sm">
                    <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={globalFilter ?? ""}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => table.setGlobalFilter(event.target.value)}
                        className="w-full pl-9"
                    />
                </div>
            </div>
            <TabsContent
                value="all"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                {renderTableContent()}
            </TabsContent>
            <TabsContent
                value="active"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                {renderTableContent()}
            </TabsContent>
            <TabsContent
                value="inactive"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                {renderTableContent()}
            </TabsContent>
            <div className="flex items-center justify-between px-4">
                <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
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
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
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
        </Tabs>
    )
}



function TableCellViewer({ userId, name }: { userId: string; name: string }) {

    const isMobile = useIsMobile()

    return (
        <ShowSidebar userId={userId} isMobile={isMobile} fallbackName={name} />
    )
}
