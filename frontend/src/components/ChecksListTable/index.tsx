"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";

export enum UptimeType {
  PING = "PING",
}

export type UptimeCheckTableDataRow = {
  id: string;
  site_name: string;
  tags: string[];
  type: UptimeType;
  uptime: number;
  up_since: number;
  respnose_time: number;
};

type CheckListTableProps = {
  checks: UptimeCheckTableDataRow[];
  fetchingUptimes: boolean;
};

export const columns: ColumnDef<UptimeCheckTableDataRow>[] = [
  {
    accessorKey: "id",
    header: "Node ID",
    cell: ({ row }) => <div className="capitalize">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "site_name",
    header: "Node Provider",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("site_name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type: UptimeType = row.getValue("type") || UptimeType.PING;
      return <div className="capitalize">{type}</div>;
    },
  },
  {
    accessorKey: "uptime",
    header: () => <div className="text-left">Uptime</div>,
    cell: ({ row }) => {
      const uptime: number | string = row.getValue("uptime") || 0;
      const uptimeString: string =
        uptime === "N/A" ? "N/A" : `${Number(uptime).toFixed(2)} %`;
      return <div className="capitalize">{uptimeString}</div>;
    },
  },
  {
    accessorKey: "up_since",
    header: () => <div className="text-left">Up since</div>,
    cell: ({ row }) => {
      return <div className="capitalize">∞</div>;
    },
  },
  {
    accessorKey: "response_time",
    header: () => <div className="text-left">Response time / Outages</div>,
    cell: ({ row }) => {
      return (
        <div className="min-w-16 flex justify-start items-center">N/A</div>
      );
    },
  },
];

const ChecksListTable = ({ checks, fetchingUptimes }: CheckListTableProps) => {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: checks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
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
                  );
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
                  className="cursor-pointer"
                  onClick={() => router.push(`/app/reports/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
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
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
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
    </div>
  );
};

export default ChecksListTable;
