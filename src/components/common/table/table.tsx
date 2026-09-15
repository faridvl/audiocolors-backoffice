import React from 'react';
import { Inbox, AlertTriangle, Loader2 } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  render: (row: T) => React.ReactNode;
  /** Oculta la columna en pantallas pequenas. */
  hideOnMobile?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  onRowClick?: (row: T) => void;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  errorTitle?: string;
  rowActions?: (row: T) => React.ReactNode;
}

const StateWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
    {children}
  </div>
);

export function Table<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  isError = false,
  onRowClick,
  onRetry,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  errorTitle = 'No se pudieron cargar los datos',
  rowActions,
}: TableProps<T>) {
  const renderBody = () => {
    if (isLoading) {
      return (
        <StateWrapper>
          <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.BODY}>Cargando...</Typography>
        </StateWrapper>
      );
    }

    if (isError) {
      return (
        <StateWrapper>
          <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
          <Typography variant={TypographyVariant.CARD_TITLE}>{errorTitle}</Typography>
          {onRetry && (
            <Button variant={ButtonVariant.SECONDARY} onClick={onRetry} className="mt-2">
              Reintentar
            </Button>
          )}
        </StateWrapper>
      );
    }

    if (!rows.length) {
      return (
        <StateWrapper>
          <Inbox className="h-8 w-8 text-navy-300" aria-hidden />
          <Typography variant={TypographyVariant.CARD_TITLE}>{emptyTitle}</Typography>
          {emptyDescription && (
            <Typography variant={TypographyVariant.BODY}>{emptyDescription}</Typography>
          )}
        </StateWrapper>
      );
    }

    return null;
  };

  const stateContent = renderBody();

  return (
    <div className="overflow-hidden rounded-card border border-navy-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-navy-200 bg-navy-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={column.width ? { width: column.width } : undefined}
                  className={tailwind(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-navy-500',
                    column.hideOnMobile && 'hidden lg:table-cell',
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions && <th className="w-16 px-4 py-3" aria-label="Acciones" />}
            </tr>
          </thead>

          {!stateContent && (
            <tbody>
              {rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={tailwind(
                    'border-b border-navy-100 last:border-b-0 transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-navy-50',
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={tailwind(
                        'px-4 py-3 align-middle text-sm text-navy-700',
                        column.hideOnMobile && 'hidden lg:table-cell',
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {stateContent}
    </div>
  );
}
