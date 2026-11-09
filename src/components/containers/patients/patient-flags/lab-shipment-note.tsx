import React, { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';

/** Nota de una entrega: 2 líneas y "Ver más" solo si el texto no cabe. */
export const LabShipmentNote: React.FC<{ text: string }> = ({ text }) => {
  const { t } = useTranslation();
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Se mide recortado: ya expandido el texto siempre cabe y el botón debe seguir ahí.
  useLayoutEffect(() => {
    const element = textRef.current;
    if (element && !isExpanded) setIsOverflowing(element.scrollHeight > element.clientHeight + 1);
  }, [text, isExpanded]);

  return (
    <div className="flex min-w-0 flex-col items-start">
      <p
        ref={textRef}
        className={tailwind(
          'whitespace-pre-wrap break-words text-sm font-normal text-ink-700 md:text-base',
          !isExpanded && 'line-clamp-2',
        )}
      >
        {text}
      </p>
      {isOverflowing && (
        <Button
          variant={ButtonVariant.GHOST}
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
          className="min-h-[36px] px-0 text-brand-700 hover:underline"
        >
          {isExpanded
            ? t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.HISTORY.NOTE_LESS)
            : t(TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.HISTORY.NOTE_MORE)}
        </Button>
      )}
    </div>
  );
};
