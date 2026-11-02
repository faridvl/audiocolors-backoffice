import React from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { formatDayKeyWithYear } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { PatientLabShipment } from '@/types/patients/patient-lab-shipment';
import { LabShipmentNote } from './lab-shipment-note';
import { COLLAPSED_SHIPMENTS, useLabShipmentHistory } from './use-lab-shipment-history';

const HISTORY = TEXT.PATIENTS.FLAGS.LAB_SHIPMENT.HISTORY;

/** Lo que pasó con un envío: ya entregado, o todavía en el laboratorio. */
const ShipmentRow: React.FC<{ shipment: PatientLabShipment }> = ({ shipment }) => {
  const { t } = useTranslation();
  const sent = formatDayKeyWithYear(shipment.sentAt);

  return (
    <li className="flex min-w-0 flex-col gap-1 rounded-lg bg-ink-50 px-3 py-2">
      {shipment.deliveredAt ? (
        <>
          <Typography variant={TypographyVariant.BODY_BOLD}>
            {t(HISTORY.DELIVERED, { date: formatDayKeyWithYear(shipment.deliveredAt) })}
          </Typography>
          <Typography variant={TypographyVariant.HELPER}>
            {t(HISTORY.SENT, { date: sent })}
          </Typography>
        </>
      ) : (
        <Typography variant={TypographyVariant.BODY_BOLD}>
          {t(HISTORY.IN_LAB, { date: sent })}
        </Typography>
      )}
      {shipment.note && <LabShipmentNote text={shipment.note} />}
      {shipment.deliveredByName && (
        <Typography variant={TypographyVariant.HELPER}>
          {t(HISTORY.DELIVERED_BY, { name: shipment.deliveredByName })}
        </Typography>
      )}
    </li>
  );
};

/** Historial de envíos al laboratorio del paciente, del más reciente al más viejo. */
export const LabShipmentHistory: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const {
    shipments,
    total,
    isLoading,
    isError,
    isEmpty,
    canExpand,
    isExpanded,
    handleRetry,
    handleToggle,
  } = useLabShipmentHistory(patientUuid);

  return (
    <section className="mt-4 flex min-w-0 flex-col gap-2" aria-label={t(HISTORY.TITLE)}>
      <Typography variant={TypographyVariant.ACCENT}>{t(HISTORY.TITLE)}</Typography>
      {isLoading && (
        <div className="flex items-center gap-2" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden />
          <Typography variant={TypographyVariant.HELPER}>{t(HISTORY.LOADING)}</Typography>
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-start gap-1">
          <Typography variant={TypographyVariant.ERROR}>{t(HISTORY.ERROR)}</Typography>
          <Button variant={ButtonVariant.SECONDARY} onClick={handleRetry}>
            {t(TEXT.GENERAL.BUTTONS.RETRY)}
          </Button>
        </div>
      )}
      {isEmpty && (
        <Typography variant={TypographyVariant.HELPER} className="text-ink-600">
          {t(HISTORY.EMPTY)}
        </Typography>
      )}
      {shipments.length > 0 && (
        <ul className="flex flex-col gap-2">
          {shipments.map((shipment) => (
            <ShipmentRow key={shipment.uuid} shipment={shipment} />
          ))}
        </ul>
      )}
      {canExpand && (
        <Button
          variant={ButtonVariant.GHOST}
          onClick={handleToggle}
          aria-expanded={isExpanded}
          className="min-h-[44px] w-fit px-0 text-brand-700 hover:underline"
        >
          {isExpanded
            ? t(HISTORY.SHOW_LESS, { count: COLLAPSED_SHIPMENTS })
            : t(HISTORY.SHOW_ALL, { count: total })}
        </Button>
      )}
    </section>
  );
};
