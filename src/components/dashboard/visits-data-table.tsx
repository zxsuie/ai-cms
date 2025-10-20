
'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useVisits } from "@/hooks/use-visits"
import { StudentVisit } from "@/lib/types"
import { format } from "date-fns"
import { ReleaseFormButton } from "./release-form-button"
import { Skeleton } from "../ui/skeleton"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

const columns: ColumnDef<StudentVisit>[] = [
    {
      accessorKey: "studentName",
      header: "Visitor Name",
      cell: ({ row }) => {
        const visit = row.original;
        const isStudent = visit.role === 'student';
        return (
            <div>
              <div className="font-medium">{visit.studentName}</div>
              <div className="text-xs text-muted-foreground">
                {isStudent ? 
                  `${visit.studentYear} - ${visit.studentSection}` :
                  visit.studentSection // Job title for staff/employee
                }
              </div>
            </div>
        )
      },
    },
    {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.role}</Badge>,
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id));
        }
    },
    {
      accessorKey: "timestamp",
      header: "Visit Time",
      cell: ({ row }) => format(new Date(row.original.timestamp), "PPpp"),
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "symptoms",
      header: "Symptoms",
    },
    {
      id: "actions",
      cell: ({ row }) => <ReleaseFormButton visit={row.original} />,
    },
];

export function VisitsDataTable() {
  const { visits, loading } = useVisits();
  const [sorting, setSorting] = React.useState<SortingState>([ { id: 'timestamp', desc: true } ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data: visits,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-10 w-1/3" />
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="flex justify-between">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-4">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
            value={(table.getColumn('role')?.getFilterValue() as string[])?.join(',') ?? 'all'}
            onValueChange={(value) => {
                 const currentFilter = table.getColumn('role')?.getFilterValue() as string[] | undefined;
                 if (value === 'all') {
                    table.getColumn('role')?.setFilterValue(undefined);
                 } else {
                    table.getColumn('role')?.setFilterValue([value]);
                 }
            }}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
