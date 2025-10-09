
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

// Moved columns definition outside the component
const columns: ColumnDef<StudentVisit>[] = [
    {
      accessorKey: "studentName",
      header: "Student",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.studentName}</div>
          <div className="text-xs text-muted-foreground">{row.original.studentYear} - {row.original.studentSection}</div>
        </div>
      ),
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
            <Skeleton className="h-10 w-1/3" />
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
       <div className="flex items-center">
        <Input
          placeholder="Search by student name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
