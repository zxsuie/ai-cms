
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointments } from "@/hooks/use-appointments"
import { Appointment, Profile } from "@/lib/types"
import { format, parse } from "date-fns"
import { Skeleton } from "../ui/skeleton"
import { supabase } from "@/lib/supabase"

const columns: ColumnDef<Appointment & { profile?: Profile | null }>[] = [
    {
      accessorKey: "studentName",
      header: "Name",
    },
     {
      accessorFn: (row) => row.original.profile?.role,
      id: 'role',
      header: "Role",
       cell: ({ row }) => {
        const role = row.original.profile?.role;
        return role ? <span className="capitalize">{role.replace('_', ' ')}</span> : 'N/A';
      },
      filterFn: (row, id, value) => {
        if (value === null || value === undefined) {
          return true;
        }
        return (value as any).includes(row.getValue(id))
      },
    },
    {
      accessorKey: "appointmentDate",
      header: "Date",
      cell: ({ row }) => format(parse(row.original.appointmentDate, 'yyyy-MM-dd', new Date()), "PP"),
    },
    {
      accessorKey: "appointmentTime",
      header: "Time",
      cell: ({ row }) => format(new Date(`1970-01-01T${row.original.appointmentTime}`), 'p'),
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
];

export function AppointmentDataTable() {
  const { appointments, loading } = useAppointments({ filter: 'all' });
  const [sorting, setSorting] = React.useState<SortingState>([ { id: 'appointmentDate', desc: true } ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [profiles, setProfiles] = React.useState<Profile[]>([]);

  // Fetch profiles to link roles to appointments
  React.useEffect(() => {
    async function fetchProfiles() {
        const { data, error } = await supabase.from('profiles').select('*');
        if (data) setProfiles(data as Profile[]);
    }
    fetchProfiles();
  }, []);
  
  const dataWithProfiles = React.useMemo(() => {
    if (!appointments.length || !profiles.length) return [];
    return appointments.map(appt => {
        const profile = profiles.find(p => p.fullName === appt.studentName);
        return { ...appt, profile };
    });
  }, [appointments, profiles]);


  const table = useReactTable({
    data: dataWithProfiles,
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
  });

  if (loading) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-48" />
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
       <div className="flex items-center justify-between">
        <Input
          placeholder="Search by name..."
          value={(table.getColumn("studentName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("studentName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
            value={(table.getColumn('role')?.getFilterValue() as string) ?? 'all'}
            onValueChange={(value) => table.getColumn('role')?.setFilterValue(value === 'all' ? null : value)}
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
                  No appointments found.
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
