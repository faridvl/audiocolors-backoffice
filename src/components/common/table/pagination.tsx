import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { tailwind } from '@/utils/tailwind-utils';

const DOTS = '...';

/**
 * Rango de paginas con elipsis: siempre muestra primera, ultima, la actual y
 * un vecino a cada lado. Evita listar 40 numeros cuando hay muchas paginas.
 */
function buildPageRange(currentPage: number, totalPages: number): (number | typeof DOTS)[] {
  const siblingCount = 1;
  const totalVisible = siblingCount * 2 + 5;

  if (totalPages <= totalVisible) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < totalPages - 1;

  if (!showLeftDots && showRightDots) {
    const leftRange = Array.from({ length: 3 + siblingCount * 2 }, (_, index) => index + 1);
    return [...leftRange, DOTS, totalPages];
  }

  if (showLeftDots && !showRightDots) {
    const count = 3 + siblingCount * 2;
    const rightRange = Array.from({ length: count }, (_, index) => totalPages - count + 1 + index);
    return [1, DOTS, ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, index) => leftSibling + index,
  );
  return [1, DOTS, ...middleRange, DOTS, totalPages];
}

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

const arrowClasses =
  'flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent';

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const range = buildPageRange(page, totalPages);

  return (
    <nav
      aria-label="Paginacion"
      className="mt-2 flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-xs text-ink-500 md:text-sm">
        Pagina {page} de {totalPages} · {total} {total === 1 ? 'registro' : 'registros'}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Pagina anterior"
          className={arrowClasses}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        {range.map((item, index) =>
          item === DOTS ? (
            <span
              key={`dots-${index}`}
              aria-hidden
              className="flex h-8 w-8 items-center justify-center text-sm text-ink-400"
            >
              {DOTS}
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={tailwind(
                'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors',
                item === page
                  ? 'bg-brand text-white'
                  : 'text-ink-600 hover:bg-ink-100',
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Pagina siguiente"
          className={arrowClasses}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
};
