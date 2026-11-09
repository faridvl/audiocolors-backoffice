import React from "react";
import { Inbox, AlertTriangle, Loader2, SearchX } from "lucide-react";
import { tailwind } from "@/utils/tailwind-utils";
import {
  Typography,
  TypographyVariant,
} from "@/components/common/typography/typography";
import { Button, ButtonVariant } from "@/components/common/button/button";
import { topStripeStyle } from "@/shared/design/tokens";

/**
 * Tabla responsive.
 *
 * En movil NO hace scroll horizontal: renderiza cada fila como una tarjeta de
 * pares etiqueta/valor. Una tabla de 5 columnas en un teléfono es ilegible, y
 * el scroll lateral esconde justo la columna que se necesita.
 *
 * PENDIENTE / deuda futura: hoy solo hay una tabla (pacientes) y las columnas
 * caben bien en el `<table>` de escritorio. Si se agrega una tabla con muchas
 * columnas, falta soporte para ocultar columnas por breakpoint intermedio
 * (p.ej. una columna que solo se ve en xl pero no en md/lg) — hoy la unica
 * variante es "en la tabla" vs "en la tarjeta movil" (hideOnCard). Ver
 * magastore-backoffice: usa `className` por columna (ej. 'hidden lg:table-cell')
 * para ese caso.
 */
export interface TableColumn<T> {
  key: string;
  header: string;
  /** Ancho de la columna en desktop, p.ej. 'w-48' o '30%'. */
  width?: string;
  render: (row: T) => React.ReactNode;
  /** Cómo se ve el valor en la tarjeta, si distinto de la tabla (p.ej. texto que se parte en vez de cortarse). */
  renderCard?: (row: T) => React.ReactNode;
  /** Oculta la columna en la tarjeta de movil (p.ej. datos redundantes). */
  hideOnCard?: boolean;
  /** Oculta la columna en la tabla de escritorio (p.ej. un dato que ya va dentro de otra columna). */
  hideOnTable?: boolean;
  /** Marca la columna que encabeza la tarjeta en movil. */
  isCardTitle?: boolean;
}

/** Color hex para la franja superior de la tarjeta movil (p.ej. sede del paciente). `undefined` no dibuja franja. */
type RowAccentColor<T> = (row: T) => string | undefined;

/** Desde qué ancho se muestra la tabla; por debajo, tarjetas. */
export enum TableBreakpoint {
  MD = "MD",
  XL = "XL",
}

// Clases completas y fijas: Tailwind no detecta nombres armados con texto.
const TABLE_VISIBILITY: Record<TableBreakpoint, string> = {
  [TableBreakpoint.MD]: "hidden md:block",
  [TableBreakpoint.XL]: "hidden xl:block",
};
const CARDS_VISIBILITY: Record<TableBreakpoint, string> = {
  [TableBreakpoint.MD]: "md:hidden",
  [TableBreakpoint.XL]: "xl:hidden",
};

export enum TableState {
  LOADING = "LOADING",
  ERROR = "ERROR",
  EMPTY = "EMPTY",
  NO_RESULTS = "NO_RESULTS",
  READY = "READY",
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
  /** Desde qué ancho se muestra la tabla en lugar de tarjetas (por defecto, md). */
  breakpoint?: TableBreakpoint;
  /** Espacio a la derecha del título de la tarjeta móvil, para que las acciones no lo tapen. */
  cardTitleClassName?: string;
  /** Color de acento en el borde superior de la tarjeta movil (p.ej. por sede). */
  rowAccentColor?: RowAccentColor<T>;
  /**
   * Etiqueta de grupo de cada fila (p.ej. el día). Cuando cambia respecto de
   * la fila anterior se intercala un separador con esa etiqueta. Las filas
   * deben venir ya ordenadas por grupo.
   */
  getRowGroup?: (row: T) => string;
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
    {description && (
      <Typography variant={TypographyVariant.BODY}>{description}</Typography>
    )}
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
  breakpoint = TableBreakpoint.MD,
  cardTitleClassName = "pr-8",
  rowAccentColor,
  getRowGroup,
  emptyTitle = "Aún no hay registros",
  emptyDescription,
  emptyAction,
  noResultsTitle = "Sin resultados",
  noResultsDescription = "Prueba con otros términos o cambia los filtros.",
  errorTitle = "No se pudieron cargar los datos",
}: ResponsiveTableProps<T>) {
  const resolveState = (): TableState => {
    if (isLoading) return TableState.LOADING;
    if (isError) return TableState.ERROR;
    if (!rows.length)
      return hasActiveFilters ? TableState.NO_RESULTS : TableState.EMPTY;
    return TableState.READY;
  };

  const state = resolveState();

  if (state !== TableState.READY) {
    const stateContent = {
      [TableState.LOADING]: (
        <StateBlock
          icon={
            <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden />
          }
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
      <div className="rounded-card border border-ink-200 bg-white">
        {stateContent}
      </div>
    );
  }

  const tableColumns = columns.filter((column) => !column.hideOnTable);
  const cardColumns = columns.filter((column) => !column.hideOnCard);
  const titleColumn =
    columns.find((column) => column.isCardTitle) ?? columns[0];
  const detailColumns = cardColumns.filter((column) => column !== titleColumn);

  /** Etiqueta del grupo si esta fila abre uno nuevo; null si sigue el anterior. */
  const groupStartLabel = (index: number): string | null => {
    if (!getRowGroup) return null;
    const label = getRowGroup(rows[index]);
    return index === 0 || getRowGroup(rows[index - 1]) !== label ? label : null;
  };

  return (
    <>
      {/* Desktop: tabla */}
      <div
        className={tailwind(
          "overflow-hidden rounded-card border border-ink-200 bg-white",
          TABLE_VISIBILITY[breakpoint],
        )}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-ink-200 bg-ink-50">
              {tableColumns.map((column) => (
                <th
                  key={column.key}
                  style={
                    column.width?.includes("%")
                      ? { width: column.width }
                      : undefined
                  }
                  className={tailwind(
                    "px-4 py-3 text-left text-sm font-bold uppercase tracking-wide text-ink-600",
                    column.width?.startsWith("w-") && column.width,
                  )}
                >
                  {column.header}
                </th>
              ))}
              {rowActions && (
                <th className="w-16 px-4 py-3" aria-label="Acciones" />
              )}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <React.Fragment key={getRowKey(row)}>
                {groupStartLabel(index) && (
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <td
                      colSpan={tableColumns.length + (rowActions ? 1 : 0)}
                      className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-500"
                    >
                      {groupStartLabel(index)}
                    </td>
                  </tr>
                )}
                <tr
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={tailwind(
                    "border-b border-ink-200 last:border-b-0 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-ink-50",
                  )}
                >
                  {tableColumns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 align-middle text-sm text-ink-700"
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
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Movil: una tarjeta por registro */}
      <div
        className={tailwind(
          "flex flex-col gap-2",
          CARDS_VISIBILITY[breakpoint],
        )}
      >
        {rows.map((row, index) => (
          <React.Fragment key={getRowKey(row)}>
            {groupStartLabel(index) && (
              <Typography
                variant={TypographyVariant.HELPER}
                className="mt-2 font-bold uppercase tracking-wide first:mt-0"
              >
                {groupStartLabel(index)}
              </Typography>
            )}
            <div
              style={topStripeStyle(rowAccentColor?.(row))}
              className="relative rounded-card border border-ink-200 bg-white p-4"
            >
              {rowActions && (
                <div
                  className="absolute right-2 top-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  {rowActions(row)}
                </div>
              )}

              <button
                type="button"
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                disabled={!onRowClick}
                className="flex w-full flex-col gap-3 text-left disabled:cursor-default"
              >
                <div className={cardTitleClassName}>
                  {(titleColumn.renderCard ?? titleColumn.render)(row)}
                </div>

                <dl className="flex flex-col gap-1.5 border-t border-ink-100 pt-3">
                  {detailColumns.map((column) => (
                    <div
                      key={column.key}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <dt className="shrink-0">
                        <Typography
                          variant={TypographyVariant.HELPER}
                          className="font-bold"
                        >
                          {column.header}
                        </Typography>
                      </dt>
                      <dd className="min-w-0 text-right text-sm text-ink-700">
                        {(column.renderCard ?? column.render)(row)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
