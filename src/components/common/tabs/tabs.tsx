import React from 'react';
import { Badge } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { tailwind } from '@/utils/tailwind-utils';

export interface TabItem<TValue extends string> {
  value: TValue;
  label: string;
  /** Conteo al lado del texto (p. ej. cuántas citas). */
  count?: number;
}

interface TabsProps<TValue extends string> {
  items: TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
}

/** Pestañas con subrayado y conteo opcional. Teclado y lector de pantalla por roles ARIA. */
export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TabsProps<TValue>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={tailwind('flex border-b border-ink-200 px-1', className)}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <Button
            key={item.value}
            variant={ButtonVariant.TAB}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.value)}
            className={tailwind(isActive && 'border-brand text-brand-700 hover:text-brand-700')}
          >
            {item.label}
            {item.count !== undefined && (
              <Badge className={tailwind(isActive && 'bg-brand-50 text-brand-700')}>
                {item.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
