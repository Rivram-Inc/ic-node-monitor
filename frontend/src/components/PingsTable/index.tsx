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
import {
  ChevronDown,
  ChevronRight,
  CircleArrowDown,
  CircleArrowUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PingDataType = {
  avg_rtt: number | string;
  packets_sent: number;
  packets_received: number;
  packet_loss: number;
  ping_at_datetime: string;
  probe_name: string;
  traceroute_data: any[];
  up: boolean;
};

type PaginationType = {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
};

type PingsTableProps = {
  logs: PingDataType[];
  pagination: PaginationType;
  pingFetching: boolean;
  fetchNextPage: () => void;
  previousPage: () => void;
};

export const columns: ColumnDef<any>[] = [
  {
    id: "up_symbol",
    header: ({ table }) => <div></div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center items-center">
          {row.original.up ? (
            <CircleArrowUp className="h-4 w-4 text-green-500 scale-150" />
          ) : (
            <CircleArrowDown className="h-4 w-4 text-red-500 scale-150" />
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: "expand_toggle",
  //   header: ({ table }) => null,
  //   cell: ({ row }) => {
  //     const [isExpanded, setIsExpanded] = React.useState(false);

  //     return (
  //       <div
  //         className="cursor-pointer flex items-center justify-center"
  //         onClick={() => setIsExpanded(!isExpanded)}
  //       >
  //         {isExpanded ? (
  //           <ChevronDown className="w-4 h-4" />
  //         ) : (
  //           <ChevronRight className="w-4 h-4" />
  //         )}
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "ping_at_datetime",
    header: "Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("ping_at_datetime"));
      return <div className="capitalize">{date.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: "avg_rtt",
    header: "Average response time",
    cell: ({ row }) => {
      const responseTime: number | string = row.getValue("avg_rtt");

      if (typeof responseTime === "string") {
        return <div className="capitalize">{responseTime}</div>;
      } else {
        return <div>{responseTime} ms</div>;
      }
    },
  },
  {
    accessorKey: "packets_sent",
    header: "Packets sent",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("packets_sent")}</div>
    ),
  },
  {
    accessorKey: "packets_received",
    header: "Packets received",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("packets_received")}</div>
    ),
  },
  {
    accessorKey: "packet_loss",
    header: "Packet loss percentage",
    cell: ({ row }) => {
      const packetLoss: string = row.getValue("packet_loss");
      return (
        <div className="capitalize">{`${
          packetLoss ? `${parseFloat(packetLoss) * 100}%` : ""
        }`}</div>
      );
    },
  },
  {
    accessorKey: "probe_name",
    header: "Probe name",
    cell: ({ row }) => {
      const probeName: string = row.original.probe_name.replace("_", " ");
      return <div className="capitalize">{probeName}</div>;
    },
  },
];

const PingsTable = ({
  logs,
  pagination,
  fetchNextPage,
  previousPage,
  pingFetching,
}: PingsTableProps) => {
  const [expandedRow, setExpandedRow] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: logs,
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

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRow((current) => (current === rowId ? null : rowId));
  };

  if (!logs?.length && pingFetching) {
    return (
      <div className="flex items-center justify-center h-24">
        <h4>Loading...</h4>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: any) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() => toggleRowExpansion(row.id)}
                    className="cursor-pointer"
                    data-state={row.getIsSelected() && "selected"}
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
                  {/* {expandedRow === row.id && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={columns.length}>
                        <div className="p-6 border-t border-gray-200">
                          <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Hop Details
                          </h3>
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-700 border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="px-4 py-2 font-medium text-gray-600">
                                    Hop Number
                                  </th>
                                  <th className="px-4 py-2 font-medium text-gray-600">
                                    IP Address
                                  </th>
                                  <th className="px-4 py-2 font-medium text-gray-600">
                                    Response Time (ms)
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {row?.original?.traceroute_data?.map(
                                  (hop: any) => (
                                    <tr
                                      key={hop.hop_number}
                                      className="border-b last:border-none hover:bg-gray-100"
                                    >
                                      <td className="px-4 py-2 text-gray-800">
                                        {hop.hop_number}
                                      </td>
                                      <td className="px-4 py-2 text-gray-800">
                                        {hop.ip_address}
                                      </td>
                                      <td className="px-4 py-2 text-gray-800">
                                        {hop.rtt} ms
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )} */}
                </React.Fragment>
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
        <Button
          variant="outline"
          size="sm"
          onClick={previousPage}
          disabled={pagination.currentPage - 1 === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchNextPage}
          disabled={
            pingFetching || pagination.currentPage + 1 >= pagination.totalPages
          }
        >
          {pingFetching ? (
            <div className="w-3 h-3 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  );
};

export default PingsTable;
