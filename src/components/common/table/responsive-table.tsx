import React from 'react';
import { Inbox, AlertTriangle, Loader2, SearchX } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { Button, ButtonVariant } from '@/components/common/button/button';

/**
 * Tabla responsive.
 *
 * En movil NO hace scroll horizontal: renderiza cada fila como una tarjeta de
 * pares etiqueta/valor. Una tabla de 5 columnas en un teléfono es ilegible, y
 * el scroll lateral esconde justo la columna que se necesita.
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  /** Ancho de la columna en desktop, p.ej. 'w-48' o '30%'. */
  width?: string;
  render: (row: T) => React.ReactNode;
  /** Oculta la columna en la tarjeta de movil (p.ej. datos redundantes). */
  hideOnCard?: boolean;
  /** Marca la columna que encabeza la tarjeta en movil. */
  isCardTitle?: boolean;
}

export enum TableState {
  LOADING = 'LOADING',
  ERROR = 'ERROR',
  EMPTY = 'EMPTY',
  NO_RESULTS = 'NO_RESULTS',
  READY = 'READY',
}

interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  isLoading?: boolean;
  isError?: boolean;
  /** true cuando hay búsqueda o filtros activos: cambia el estado vacio. */
  hasActiveFilters?: boolean;
  onRowClick?: (row: T) => void;
  onRetry?: () => void;
  rowActions?: (row: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  noResultsTitle?: string;
  noResultsDescription?: string;
  errorTitle?: string;
}

const StateBlock: React.FC<{
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
    {icon}
    <Typography variant={TypographyVariant.ACCENT}>{title}</Typography>
    {description && <Typography variant={TypographyVariant.BODY}>{description}</Typography>}
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export function ResponsiveTable<T>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  isError = false,
  hasActiveFilters = false,
  onRowClick,
  onRetry,
  rowActions,
  emptyTitle = 'Aún no hay registros',
  emptyDescription,
  emptyAction,
  noResultsTitle = 'Sin resultados',
  noResultsDescription = 'Prueba con otros términos o cambia los filtros.',
  errorTitle = 'No se pudieron cargar los datos',
}: ResponsiveTableProps<T>) {
  const resolveState = (): TableState => {
    if (isLoading) return TableState.LOADING;
    if (isError) return TableState.ERROR;
    if (!rows.length) return hasActiveFilters ? TableState.NO_RESULTS : TableState.EMPTY;
    return TableState.READY;
  };

  const state = resolveState();

  if (state !== TableState.READY) {
    const stateContent = {
      [TableState.LOADING]: (
        <StateBlock
          icon={<Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />}
          title="Cargando..."
        />
      ),
      [TableState.ERROR]: (
        <StateBlock
          icon={<AlertTriangle className="h-8 w-8 text-danger" aria-hidden />}
          title={errorTitle}
          action={
            onRetry && (
              <Button variant={ButtonVariant.SECONDARY} onClick={onRetry}>
                Reintentar
              </Button>
            )
          }
        />
      ),
      [TableState.NO_RESULTS]: (
        <StateBlock
          icon={<SearchX className="h-8 w-8 text-ink-300" aria-hidden />}
          title={noResultsTitle}
          description={noResultsDescription}
        />
      ),
      [TableState.EMPTY]: (
        <StateBlock
          icon={<Inbox className="h-8 w-8 text-ink-300" aria-hidden />}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ),
    }[state];

    return (
      <div className="rounded-card border border-ink-200 bg-white">{stateContent}</div>
    );
  }

  const cardColumns = columns.filter((column) => !column.hideOnCard);
  const titleColumn = columns.find((column) => column.isCardTitle) ?? columns[0];
  const detailColumns = cardColumns.filter((column) => column !== titleColumn);

  return (
    <>
      {/* Desktop: tabla */}
      <div className="hidden overflow-hidden rounded-card border border-ink-200 bg-white md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={column.width?.includes('%') ? { width: column.width } : undefined}
                  className={tailwind(
                    'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500',
                    column.width?.startsWith('w-') && column.width,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions && <th className="w-16 px-4 py-3" aria-label="Acciones" />}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={tailwind(
                  'border-b border-ink-100 last:border-b-0 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-ink-50',
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 align-middle text-sm text-ink-700">
                    {column.render(row)}
                  </td>
                ))}
                {rowActions && (
                  <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    {rowActions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movil: una tarjeta por registro */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((row) => (
          <div
            key={getRowKey(row)}
            className="relative rounded-card border border-ink-200 bg-white p-4"
          >
            {rowActions && (
              <div className="absolute right-2 top-2" onClick={(event) => event.stopPropagation()}>
                {rowActions(row)}
              </div>
            )}

            <button
              type="button"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              disabled={!onRowClick}
              className="flex w-full flex-col gap-3 text-left disabled:cursor-default"
            >
              <div className="pr-8">{titleColumn.render(row)}</div>

              <dl className="flex flex-col gap-1.5 border-t border-ink-100 pt-3">
                {detailColumns.map((column) => (
                  <div key={column.key} className="flex items-baseline justify-between gap-3">
                    <dt className="shrink-0">
                      <Typography variant={TypographyVariant.HELPER}>{column.header}</Typography>
                    </dt>
                    <dd className="min-w-0 text-right text-sm text-ink-700">
                      {column.render(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
