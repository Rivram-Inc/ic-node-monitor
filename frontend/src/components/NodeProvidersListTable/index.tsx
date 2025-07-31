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

// Simplified and aligned interface for node providers
export interface NodeProvider {
  node_provider_id: string;
  node_provider_name: string;
  uptime_30d: number;
}

// Pagination interface
interface PaginationState {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

// Component props interface
interface NodeProvidersListTableProps {
  nodes: NodeProvider[];
  fetchingUptimes: boolean;
  pagination: PaginationState;
  fetchNextPage: () => Promise<void>;
  previousPage: () => void;
}

const NodeProvidersListTable: React.FC<NodeProvidersListTableProps> = ({
  nodes,
  fetchingUptimes,
  pagination,
  fetchNextPage,
  previousPage,
}) => {
  const router = useRouter();

  // Memoized state to prevent unnecessary re-renders
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Memoized columns definition
  const columns = React.useMemo<ColumnDef<NodeProvider>[]>(
    () => [
      {
        accessorKey: "node_provider_name",
        header: "Node Provider Name",
        cell: ({ row }) => (
          <div className="capitalize text-sm font-medium">
            {row.getValue("node_provider_name") || "Unknown"}
          </div>
        ),
      },
      {
        accessorKey: "node_provider_id",
        header: "Provider ID",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.getValue("node_provider_id") || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "uptime_30d",
        header: () => <div className="text-left">30d Uptime %</div>,
        cell: ({ row }) => {
          const uptime = row.getValue("uptime_30d") as number;
          const uptimeDisplay =
            typeof uptime === "number" ? `${uptime.toFixed(2)} %` : "N/A";

          return (
            <div className="capitalize" style={{ fontSize: ".8rem" }}>
              {uptimeDisplay}
            </div>
          );
        },
      },
    ],
    []
  );

  // Memoized click handler to prevent recreation on every render
  const handleRowClick = React.useCallback(
    (nodeProviderId: string) => {
      router.push(`/app/node_providers/${nodeProviderId}`);
    },
    [router]
  );

  // Memoized pagination handlers
  const handlePreviousPage = React.useCallback(() => {
    previousPage();
  }, [previousPage]);

  const handleNextPage = React.useCallback(async () => {
    await fetchNextPage();
    table.nextPage();
  }, [fetchNextPage]);

  // Table configuration
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
    // Performance optimization: disable automatic pagination
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  // Loading state for the table body
  if (fetchingUptimes && nodes.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleRowClick(row.original.node_provider_id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                  className="h-24 text-center text-gray-500"
                >
                  {fetchingUptimes ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Loading...</span>
                    </div>
                  ) : (
                    "No node providers found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-gray-700">
          Showing{" "}
          {Math.min(
            (pagination.currentPage - 1) * pagination.pageSize + 1,
            pagination.totalItems
          )}{" "}
          to{" "}
          {Math.min(
            pagination.currentPage * pagination.pageSize,
            pagination.totalItems
          )}{" "}
          of {pagination.totalItems} results
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={pagination.currentPage <= 1 || fetchingUptimes}
          >
            Previous
          </Button>

          <span className="text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={
              pagination.currentPage >= pagination.totalPages || fetchingUptimes
            }
          >
            {fetchingUptimes ? "Loading..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(NodeProvidersListTable);
