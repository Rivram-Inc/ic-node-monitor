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
  // type: UptimeType;
  type: string;
  uptime: number;
  up_since: number;
  respnose_time?: number;
  last_response_time?: number;
  node_id?: number;
  node_provider_name?: string;
  region?: string;
  node_provider_id: string;
};

type PaginationType = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

type NodesListTableProps = {
  nodes: UptimeCheckTableDataRow[];
  fetchingUptimes: boolean;
  pagination: PaginationType;
  fetchNextPage: () => void;
  previousPage: () => void;
};

const NodesListTable = ({
  nodes,
  fetchingUptimes,
  pagination,
  fetchNextPage,
  previousPage,
}: NodesListTableProps) => {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns: ColumnDef<UptimeCheckTableDataRow>[] = [
    {
      accessorKey: "node_id",
      header: "Node ID",
      cell: ({ row }) => (
        <div className="capitalize" style={{ fontSize: ".8rem" }}>
          {row.getValue("node_id")}
        </div>
      ),
    },
    {
      accessorKey: "node_provider_name",
      header: "Node Provider",
      cell: ({ row }) => {
        const nodeProvoiderID = row.original.node_provider_id;
        return (
          <div
            id="node-provider-id-cell"
            className={`capitalize ${
              nodeProvoiderID
                ? "cursor-pointer hover:text-blue-400 ease-in-out transition-all"
                : ""
            }`}
            style={{ fontSize: ".8rem" }}
            onClick={(e) => {
              if (nodeProvoiderID) {
                e.preventDefault();
                router.push(`/app/node_providers/${nodeProvoiderID}`);
                return;
              }
            }}
          >
            {row.getValue("node_provider_name")}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        // const type: UptimeType = row.getValue("type") || UptimeType.PING;
        return (
          <div className="capitalize" style={{ fontSize: ".8rem" }}>
            {row.getValue("type")}
          </div>
        );
      },
    },
    // {
    //   accessorKey: "uptime",
    //   header: () => <div className="text-left">Uptime</div>,
    //   cell: ({ row }) => {
    //     const uptime: number | string = row.getValue("uptime") || 0;
    //     const uptimeString: string =
    //       uptime === "N/A" ? "N/A" : `${Number(uptime).toFixed(2)} %`;
    //     return (
    //       <div className="capitalize" style={{ fontSize: ".8rem" }}>
    //         {uptimeString}
    //       </div>
    //     );
    //   },
    // },
    // {
    //   accessorKey: "up_since",
    //   header: () => <div className="text-left">Up since</div>,
    //   cell: ({ row }) => {
    //     return (
    //       <div className="capitalize" style={{ fontSize: ".8rem" }}>
    //         ∞
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "last_response_time",
      header: () => <div className="text-left">Last response time</div>,
      cell: ({ row }) => {
        return (
          <div
            className="min-w-16 flex justify-start items-center"
            style={{ fontSize: ".8rem" }}
          >
            N/A
          </div>
        );
      },
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => (
        <div className="capitalize" style={{ fontSize: ".8rem" }}>
          {row.getValue("region")}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: nodes,
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
      pagination: {
        pageIndex: pagination.currentPage - 1,
        pageSize: pagination.pageSize,
      },
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
                  onClick={(e: any) => {
                    if (e.target.id === "node-provider-id-cell") return;
                    return router.push(`/app/reports/${row.original.id}`);
                  }}
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
            onClick={() => {
              // setCurrentPage((prev) => prev - 1);
              // table.previousPage();
              previousPage();
            }}
            // disabled={!table.getCanPreviousPage()}
            disabled={pagination.currentPage - 1 === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              // setCurrentPage((prev) => prev + 1);
              await fetchNextPage();
              table.nextPage();
            }}
            // disabled={!table.getCanNextPage()}
            disabled={pagination.currentPage + 1 >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NodesListTable;
