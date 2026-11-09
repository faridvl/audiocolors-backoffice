import React from 'react';
import { useTranslation } from 'react-i18next';
import { ClinicBrand } from '@/components/common/brand/clinic-brand';
import { formatDate } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AudiogramChart } from './audiogram-chart';
import { EarSummary } from './audiometry-calculations';
import {
  AudiogramMarks,
  AudiometryTool,
  AudiometryNotes,
  EARS,
  Ear,
  FailedWordsValues,
  GradingScale,
  PtaType,
  SpeechField,
  SpeechFieldValues,
  SpeechMarks,
  WEBER_FREQUENCIES_HZ,
  WeberResult,
} from './audiometry-constants';
import {
  EAR_LABEL_KEYS,
  GRADE_LABEL_KEYS,
  PTA_TYPE_LABEL_KEYS,
  WEBER_LABEL_KEYS,
} from './audiometry-labels';
import { GradeLabelsCenter } from './grade-labels-column';
import { SpeechAudiogramChart } from './speech-audiogram-chart';
import { WordListType } from './speech-word-lists';
import { AudiometryInvalidationNotice, PrintReportHeader } from './use-audiometry-poc';
import { WEBER_ICONS } from './weber-icons';
import { ReadOnlyValue } from './audiometry-read-only-value';

const AUDIOMETRY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY;
const REPORT_TEXT = AUDIOMETRY_TEXT.REPORT;
const SUMMARY_TEXT = AUDIOMETRY_TEXT.SUMMARY;

// El oído derecho se dibuja a la derecha, como se ve al paciente de frente.
const AUDIOGRAM_EARS: Ear[] = [Ear.LEFT, Ear.RIGHT];
const CENTER_COLUMN_INDEX = 1;
// El informe solo muestra: los gráficos no reaccionan a clics.
const NO_OP = (): void => undefined;

const EAR_TEXT_CLASSES: Record<Ear, string> = {
  [Ear.LEFT]: 'text-info',
  [Ear.RIGHT]: 'text-danger-700',
};

const SECTION_TITLE_CLASSES = 'text-xs font-semibold uppercase tracking-wide text-ink-500';
const TABLE_CLASSES = 'w-full border-collapse text-xs';
const HEAD_CELL_CLASSES = 'border border-ink-200 bg-ink-50 px-2 py-1 text-left font-semibold';
const CELL_CLASSES = 'border border-ink-200 px-2 py-1';

export interface AudiometryPrintReportProps {
  header: PrintReportHeader;
  entryDate: string;
  professional: string;
  marks: AudiogramMarks;
  gradingScale: GradingScale;
  speechMarks: SpeechMarks;
  weber: Record<number, WeberResult>;
  summaries: Record<Ear, EarSummary>;
  /** Método elegido en la audiometría; sin él la fila muestra la etiqueta genérica del PTA. */
  ptaType: PtaType | null;
  speechFieldValues: SpeechFieldValues;
  failedWords: FailedWordsValues;
  presentedWords: number;
  notes: AudiometryNotes;
  /**
   * Dentro del resumen del paciente: sin logo, ficha ni firma propios (el resumen los pone una
   * sola vez) y sin salto de hoja forzado.
   */
  isEmbedded?: boolean;
  /** Informe suelto de una audiometría marcada como mal hecha: se avisa arriba, bien visible. */
  invalidation?: AudiometryInvalidationNotice | null;
  /** Para mostrar el informe suelto en pantalla (por ejemplo en un modal); por defecto solo sale al imprimir. */
  isVisibleOnScreen?: boolean;
}

/** Solo se ve al imprimir: informe clínico de la audiometría guardada, hecho para una hoja A4. */
export const AudiometryPrintReport: React.FC<AudiometryPrintReportProps> = ({
  header,
  entryDate,
  professional,
  marks,
  gradingScale,
  speechMarks,
  weber,
  summaries,
  ptaType,
  speechFieldValues,
  notes,
  isEmbedded = false,
  invalidation = null,
  isVisibleOnScreen = false,
}) => {
  const { t } = useTranslation();
  const empty = t(SUMMARY_TEXT.EMPTY);
  const ageText =
    header.patientAge !== null ? t(TEXT.PATIENTS.DETAIL.AGE, { count: header.patientAge }) : '';

  const patientFields = [
    { label: t(REPORT_TEXT.PATIENT), value: header.patientName },
    { label: t(REPORT_TEXT.DOCUMENT_ID), value: header.patientDocumentId },
    { label: t(REPORT_TEXT.AGE), value: ageText },
    { label: t(REPORT_TEXT.BIRTH_DATE), value: header.patientBirthDate },
    { label: t(REPORT_TEXT.DATE), value: entryDate },
    { label: t(REPORT_TEXT.PROFESSIONAL), value: professional },
  ].filter((field) => field.value !== '');
  const embeddedFields = [
    { label: t(REPORT_TEXT.DATE), value: entryDate },
    { label: t(REPORT_TEXT.PROFESSIONAL), value: professional },
  ].filter((field) => field.value !== '');

  const earValue = (ear: Ear, field: SpeechField): string => speechFieldValues[ear][field] || empty;

  const summaryRows = [
    {
      key: 'pta',
      label: ptaType ? t(PTA_TYPE_LABEL_KEYS[ptaType]) : t(SUMMARY_TEXT.PTA),
      getValue: (ear: Ear) =>
        summaries[ear].pta !== null
          ? t(SUMMARY_TEXT.PTA_VALUE, { value: summaries[ear].pta })
          : empty,
    },
    {
      key: 'grade',
      label: t(SUMMARY_TEXT.GRADE),
      getValue: (ear: Ear) => {
        const { grade } = summaries[ear];
        return grade ? t(GRADE_LABEL_KEYS[grade]) : empty;
      },
    },
    {
      key: 'threshold',
      label: t(SUMMARY_TEXT.SPEECH_THRESHOLD),
      getValue: (ear: Ear) => earValue(ear, SpeechField.THRESHOLD),
    },
    {
      key: 'discrimination',
      label: t(SUMMARY_TEXT.MAX_DISCRIMINATION),
      getValue: (ear: Ear) => earValue(ear, SpeechField.MAX_DISCRIMINATION),
    },
  ];

  const textSections = [
    { key: 'diagnosis', title: t(AUDIOMETRY_TEXT.NOTES.DIAGNOSIS_TITLE), text: notes.diagnosis },
    {
      key: 'observations',
      title: t(AUDIOMETRY_TEXT.NOTES.OBSERVATIONS_TITLE),
      text: notes.observations,
    },
  ];

  return (
    <article
      {...(isEmbedded ? { 'data-print-summary-section': '' } : { 'data-print-report': '' })}
      className={tailwind(
        'flex-col gap-2 bg-white text-xs leading-snug text-ink-700',
        isEmbedded || isVisibleOnScreen ? 'flex' : 'hidden print:flex',
      )}
    >
      {isEmbedded && (
        <header className="flex flex-col gap-1 border-b border-ink-300 pb-1">
          <h2 className="text-base font-semibold text-ink-900">{t(REPORT_TEXT.TITLE)}</h2>
          <dl className="flex flex-wrap gap-x-4 gap-y-0.5">
            {embeddedFields.map((field) => (
              <div key={field.label} className="flex gap-1">
                <dt className="text-ink-500">{field.label}:</dt>
                <dd className="font-medium text-ink-800">{field.value}</dd>
              </div>
            ))}
          </dl>
        </header>
      )}
      {!isEmbedded && (
        <header className="flex items-start justify-between gap-4 border-b-2 border-ink-300 pb-2">
          <div className="flex flex-col gap-1">
            <ClinicBrand logoUrl={header.clinicLogoUrl} name={header.clinicName} height={40} />
            {header.clinicLogoUrl && header.clinicName && (
              <p className="text-sm font-semibold text-ink-800">{header.clinicName}</p>
            )}
          </div>
          <h1 className="text-right text-xl font-semibold text-ink-900">{t(REPORT_TEXT.TITLE)}</h1>
        </header>
      )}

      {!isEmbedded && invalidation && (
        <div
          role="note"
          className="rounded border-2 border-danger bg-danger/10 px-3 py-1.5 text-danger-700"
        >
          <p className="text-sm font-semibold">
            {t(AUDIOMETRY_TEXT.INVALIDATE.BANNER, {
              author: invalidation.author,
              date: invalidation.date,
            })}
          </p>
          <p>{t(AUDIOMETRY_TEXT.INVALIDATE.BANNER_REASON, { reason: invalidation.reason })}</p>
        </div>
      )}

      {!isEmbedded && (
        <dl className="grid grid-cols-3 gap-x-4 gap-y-1.5 rounded border border-ink-200 bg-ink-50 px-3 py-2">
          {patientFields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-[10px] uppercase tracking-wide text-ink-500">{field.label}</dt>
              <dd className="font-medium text-ink-800">{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <section className="flex flex-col gap-2 break-inside-avoid">
        <h2 className={SECTION_TITLE_CLASSES}>{t(AUDIOMETRY_TEXT.AUDIOGRAM_TITLE)}</h2>
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
          {AUDIOGRAM_EARS.map((ear, index) => (
            <React.Fragment key={ear}>
              {index === CENTER_COLUMN_INDEX && (
                <GradeLabelsCenter gradingScale={gradingScale} isSheetSize />
              )}
              <AudiogramChart
                ear={ear}
                marks={marks}
                activeTool={AudiometryTool.AIR}
                gradingScale={gradingScale}
                onPlace={NO_OP}
                onRemove={NO_OP}
                isReadOnly
                hasGradeLabels={false}
              />
            </React.Fragment>
          ))}
        </div>
      </section>
      <section className="flex break-inside-avoid flex-col gap-2">
        <h2 className={SECTION_TITLE_CLASSES}>{t(SUMMARY_TEXT.WEBER_TITLE)}</h2>
        <table className={TABLE_CLASSES}>
          <thead>
            <tr>
              {WEBER_FREQUENCIES_HZ.map((frequencyHz) => (
                <th key={frequencyHz} className={HEAD_CELL_CLASSES}>
                  {t(REPORT_TEXT.FREQUENCY_HZ, { frequency: frequencyHz })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {WEBER_FREQUENCIES_HZ.map((frequencyHz) => (
                <td key={frequencyHz} className={CELL_CLASSES}>
                  {weber[frequencyHz] ? (
                    <span className="inline-flex items-center gap-1.5">
                      {WEBER_ICONS[weber[frequencyHz]]}
                      {t(WEBER_LABEL_KEYS[weber[frequencyHz]])}
                    </span>
                  ) : (
                    empty
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      <div className="grid grid-cols-2 items-start gap-4">
        <section className="flex min-w-0 break-inside-avoid flex-col gap-2">
          <h2 className={SECTION_TITLE_CLASSES}>{t(AUDIOMETRY_TEXT.SPEECH.TITLE)}</h2>
          <SpeechAudiogramChart
            marks={speechMarks}
            activeEar={Ear.RIGHT}
            onPlace={NO_OP}
            onRemove={NO_OP}
            isReadOnly
          />
        </section>

        <div className="flex min-w-0 flex-col gap-2">
          <section className="flex break-inside-avoid flex-col gap-2">
            <h2 className={SECTION_TITLE_CLASSES}>{t(SUMMARY_TEXT.TITLE)}</h2>
            <table className={TABLE_CLASSES}>
              <thead>
                <tr>
                  <th className={HEAD_CELL_CLASSES}>{t(SUMMARY_TEXT.METRIC)}</th>
                  {EARS.map((ear) => (
                    <th key={ear} className={tailwind(HEAD_CELL_CLASSES, EAR_TEXT_CLASSES[ear])}>
                      {t(EAR_LABEL_KEYS[ear])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className={tailwind(CELL_CLASSES, 'text-left font-medium')}>
                      {row.label}
                    </th>
                    {EARS.map((ear) => (
                      <td key={ear} className={tailwind(CELL_CLASSES, 'font-medium')}>
                        {row.getValue(ear)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {/* Diagnóstico, observaciones y firma pasan juntos a la hoja siguiente si no caben. */}
      <div className="flex break-inside-avoid flex-col gap-2">
        {textSections.map((section) => (
          <section key={section.key} className="flex break-inside-avoid flex-col gap-1">
            <h2 className={SECTION_TITLE_CLASSES}>{section.title}</h2>
            <ReadOnlyValue
              value={section.text}
              className="block min-h-[1.25em] whitespace-pre-line text-sm text-ink-800"
              isCorrectable={isEmbedded}
            />
          </section>
        ))}

        {!isEmbedded && (
          <footer className="mt-1 flex items-end justify-between gap-6 pt-2">
            <div className="flex w-64 flex-col gap-1 border-t border-ink-500 pt-1">
              <p className="text-sm font-medium text-ink-800">{professional}</p>
              <p className="text-[10px] uppercase tracking-wide text-ink-500">
                {t(REPORT_TEXT.SIGNATURE)}
              </p>
            </div>
            <p className="text-[10px] text-ink-500">
              {t(REPORT_TEXT.PRINTED_ON, { date: formatDate(new Date().toISOString()) })}
            </p>
          </footer>
        )}
      </div>
    </article>
  );
};
