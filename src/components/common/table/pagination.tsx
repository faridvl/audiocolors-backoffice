import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  total,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
      <Typography variant={TypographyVariant.CAPTION}>
        Pagina {page} de {totalPages} · {total} {total === 1 ? 'paciente' : 'pacientes'}
      </Typography>

      <div className="flex items-center gap-2">
        <Button
          variant={ButtonVariant.SECONDARY}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          icon={<ChevronLeft className="h-4 w-4" aria-hidden />}
        >
          Anterior
        </Button>
        <Button
          variant={ButtonVariant.SECONDARY}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
};
