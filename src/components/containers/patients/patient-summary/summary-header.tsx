import React from 'react';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '@/components/common/brand/brand-logo';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import {
  calculateAge,
  EMPTY_VALUE,
  formatCalendarDate,
  formatDate,
} from '@/shared/utils/formatters';
import { formatPhoneForDisplay } from '@/shared/utils/phone';
import { TEXT } from '@/static/texts/i18n';
import { SummaryPatient, SummaryTenant } from './patient-summary-types';

const REPORT_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.REPORT;
const DOCUMENT_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY.DOCUMENT;
const BRANCH_SEPARATOR = ', ';

interface SummaryHeaderProps {
  tenant: SummaryTenant;
  summaryPatient: SummaryPatient;
  issuedAt: string;
}

export const SummaryHeader: React.FC<SummaryHeaderProps> = ({
  tenant,
  summaryPatient,
  issuedAt,
}) => {
  const { t } = useTranslation();
  const { patient, branchNames } = summaryPatient;
  const age = calculateAge(patient.birthDate);

  const fields = [
    { label: t(REPORT_TEXT.PATIENT), value: `${patient.firstName} ${patient.lastName}`.trim() },
    { label: t(REPORT_TEXT.DOCUMENT_ID), value: patient.documentId ?? EMPTY_VALUE },
    {
      label: t(REPORT_TEXT.BIRTH_DATE),
      value: patient.birthDate ? formatCalendarDate(patient.birthDate) : EMPTY_VALUE,
    },
    {
      label: t(REPORT_TEXT.AGE),
      value: age !== null ? t(TEXT.PATIENTS.DETAIL.AGE, { count: age }) : EMPTY_VALUE,
    },
    {
      label: t(DOCUMENT_TEXT.PHONE),
      value: patient.phone ? formatPhoneForDisplay(patient.phone) : EMPTY_VALUE,
    },
    {
      label: t(DOCUMENT_TEXT.BRANCH, { count: branchNames.length }),
      value: branchNames.join(BRANCH_SEPARATOR),
    },
    { label: t(DOCUMENT_TEXT.ISSUED), value: formatDate(issuedAt) },
  ];

  return (
    <header className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4 border-b-2 border-ink-300 pb-2">
        <div className="flex flex-col gap-1">
          {tenant.logoUrl ? (
            // Logo de la clínica en un host remoto que next/image no tiene configurado.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-auto" />
          ) : (
            <BrandLogo height={40} />
          )}
          {tenant.name && (
            <Typography variant={TypographyVariant.BODY_SEMIBOLD}>{tenant.name}</Typography>
          )}
        </div>
        <Typography variant={TypographyVariant.HEADER} className="text-right">
          {t(DOCUMENT_TEXT.TITLE)}
        </Typography>
      </div>
      <dl className="grid grid-cols-3 gap-x-4 gap-y-1.5 rounded border border-ink-200 bg-ink-50 px-3 py-2">
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[10px] uppercase tracking-wide text-ink-500">{field.label}</dt>
            <dd className="min-h-[1.25em] text-sm font-medium text-ink-800">{field.value}</dd>
          </div>
        ))}
      </dl>
    </header>
  );
};
