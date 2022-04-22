import * as React from 'react';
import {
  createTable,
  getCoreRowModelSync,
  getGlobalFilteredRowModelSync,
  getPaginationRowModel,
  useTableInstance,
  PaginationState,
} from '@tanstack/react-table';
import Table from 'components/Table';
import useStreamsAndHistory from 'queries/useStreamsAndHistory';
import { IHistory } from 'types';
import { secondsByDuration } from 'utils/constants';
import { formatAddress } from 'utils/address';
import { formatAmountInTable } from 'utils/amount';
import ActionName from './ActionName';
import HistoryActions from './HistoryActions';
import Fallback from 'components/FallbackList';
import { HistoryIcon } from 'components/Icons';
import { downloadHistory } from 'utils/downloadCsv';
import Tooltip from 'components/Tooltip';

const table = createTable<{ Row: IHistory }>();

const defaultColumns = table.createColumns([
  table.createDisplayColumn({
    id: 'action',
    header: 'Action',
    cell: ({ cell }) => cell.row.original && <ActionName data={cell.row.original} />,
  }),
  table.createDataColumn('addressType', {
    header: 'Type',
    cell: ({ value }) => <span>{value === 'payer' ? 'Outgoing' : 'Incoming'}</span>,
  }),
  table.createDataColumn('addressRelated', {
    header: 'Address related',
    cell: ({ value }) => <Tooltip content={value}>{value && formatAddress(value)}</Tooltip>,
  }),
  table.createDataColumn('amountPerSec', {
    header: () => (
      <>
        <span>Amount</span>
        <small className="mx-1 text-xs font-normal text-gray-500 dark:text-gray-400">per month</small>
      </>
    ),
    cell: ({ value, cell }) => {
      const isDataValid = !Number.isNaN(value);
      const amount = isDataValid && formatAmountInTable(Number(value) / 1e20, secondsByDuration['month']);
      const symbol = cell.row.original?.stream?.token?.symbol ?? null;
      return (
        <>
          <span>{amount}</span>
          <span className="mx-1 text-xs text-gray-500 dark:text-gray-400">{symbol}</span>
        </>
      );
    },
  }),
  table.createDisplayColumn({
    id: 'historyActions',
    header: '',
    cell: ({ cell }) => cell.row.original && <HistoryActions data={cell.row.original} />,
  }),
]);

export function HistoryTable() {
  const { data, isLoading, error } = useStreamsAndHistory();

  const history = React.useMemo(() => {
    if (!data?.history || data.history?.length < 1) return false;

    return data.history;
  }, [data]);

  return (
    <section className="w-full">
      <span className="section-header flex items-center gap-[0.625rem]">
        <HistoryIcon />
        <h1 className="font-exo">History</h1>
      </span>

      {isLoading || error || !history ? (
        <Fallback isLoading={isLoading} isError={error ? true : false} noData={true} type="history" />
      ) : (
        <NewTable data={data.history || []} />
      )}
    </section>
  );
}

function NewTable({ data }: { data: IHistory[] }) {
  const [columns] = React.useState<typeof defaultColumns>(() => [...defaultColumns]);

  const [globalFilter, setGlobalFilter] = React.useState('');

  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
    pageCount: -1, // -1 allows the table to calculate the page count for us via instance.getPageCount()
  });

  const instance = useTableInstance(table, {
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },

    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModelSync(),
    getGlobalFilteredRowModel: getGlobalFilteredRowModelSync(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
  });

  const downloadToCSV = React.useCallback(() => downloadHistory(data), [data]);

  return (
    <>
      {/* <label className="space-x-4">
          <span>Search</span>
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="h-8 rounded border border-neutral-300 p-2 shadow-sm dark:border-neutral-700"
          />
        </label> */}

      <Table instance={instance} downloadToCSV={downloadToCSV} />
    </>
  );
}
