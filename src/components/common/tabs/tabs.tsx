import React, { useEffect, useRef } from 'react';
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

/**
 * Pestañas con subrayado y conteo opcional. Teclado y lector de pantalla por roles ARIA.
 * Si no caben, la lista se desplaza por dentro y la pestaña activa se lleva a la vista.
 */
export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TabsProps<TValue>) {
  const listRef = useRef<HTMLDivElement>(null);

  // Se mueve solo el scroll de la lista: scrollIntoView movería también el modal o la página.
  useEffect(() => {
    const list = listRef.current;
    const activeTab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !activeTab) return;
    const tabEnd = activeTab.offsetLeft + activeTab.offsetWidth;
    if (activeTab.offsetLeft < list.scrollLeft) {
      list.scrollLeft = activeTab.offsetLeft;
    } else if (tabEnd > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = tabEnd - list.clientWidth;
    }
  }, [value]);

  return (
    <div className={tailwind('border-b border-ink-200 px-1', className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className="relative -mb-px flex overflow-x-auto pb-px"
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
              className={tailwind(
                'shrink-0 whitespace-nowrap',
                isActive && 'border-brand text-brand-700 hover:text-brand-700',
              )}
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
    </div>
  );
}
