import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { useSession } from '@/hooks/use-session';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import {
  useDocumentTemplatesContentQueries,
  useDocumentTemplatesQuery,
} from '@/shared/api/querys/document-templates-query';
import {
  useAudiometryEntriesDetailQueries,
  useAudiometryEntriesQuery,
  useAudiometryEntryQuery,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { usePatientBackgroundQuery } from '@/shared/api/querys/patient-background-query';
import { useOtoscopyEntriesQuery } from '@/shared/api/querys/patient-otoscopy-entries-query';
import { useTenantQuery } from '@/shared/api/querys/tenant-query';
import { Permission } from '@/shared/auth/permissions';
import { calculateAge, formatCalendarDate, formatDateTime } from '@/shared/utils/formatters';
import { buildPrintFileName } from '@/shared/utils/print-file-name';
import { TEXT } from '@/static/texts/i18n';
import { Patient, getPatientBranchUuids } from '@/types/patients/patient';
import { buildEntryDateLabels } from '../patient-audiometry/audiometry-entry-date-labels';
import { buildEntryWithPtaLabel } from '../patient-audiometry/audiometry-labels';
import { PrintReportHeader } from '../patient-audiometry/use-audiometry-poc';
import { PatientSummaryPrintProps } from './patient-summary-print';
import { resolveKnownAuthor } from './summary-authorship';
import { buildSummaryAudiometry, buildTemplateValues } from './summary-print-data';
import {
  filterValidAudiometries,
  resolveDefaultAudiometryUuids,
  resolveSelectedAudiometries,
} from './summary-audiometry-selection';

const SUMMARY_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY;

export enum SummaryCard {
  TECHNICAL_SHEET = 'TECHNICAL_SHEET',
  TEMPLATES = 'TEMPLATES',
  BACKGROUND = 'BACKGROUND',
  OTOSCOPY = 'OTOSCOPY',
  AUDIOMETRY = 'AUDIOMETRY',
}

export interface AudiometryOption {
  value: string;
  label: string;
}

export interface SummaryCardState {
  card: SummaryCard;
  isAvailable: boolean;
  isChecked: boolean;
  isLoading: boolean;
  /** La consulta de esta tarjeta falló: dice "No se pudo cargar" y ofrece reintentar. */
  isError: boolean;
  onRetry: () => void;
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

export interface SummaryPreview {
  printProps: PatientSummaryPrintProps;
  /** Título del documento: el nombre con que el navegador propone guardar el PDF. */
  fileName: string;
}

export function usePatientSummary(patient: Patient) {
  const { t } = useTranslation();
  const { user, tenant } = useSession();
  const { can } = usePermissions();
  const canViewClinical = can(Permission.VIEW_CLINICAL_RECORD);
  // Sin uuid las consultas clínicas no se hacen: un rol sin acceso no las pide.
  const clinicalUuid = canViewClinical ? patient.uuid : '';

  const [checked, setChecked] = useState<Record<SummaryCard, boolean>>({
    [SummaryCard.TECHNICAL_SHEET]: true,
    [SummaryCard.TEMPLATES]: false,
    [SummaryCard.BACKGROUND]: false,
    [SummaryCard.OTOSCOPY]: false,
    [SummaryCard.AUDIOMETRY]: false,
  });
  const [templateUuids, setTemplateUuids] = useState<string[]>([]);
  // Mientras el usuario no elija, rige el valor por defecto: la audiometría válida más reciente.
  const [chosenAudiometryUuids, setChosenAudiometryUuids] = useState<string[] | null>(null);
  // Datos congelados al generar: la vista previa no cambia aunque las consultas se refresquen.
  const [preview, setPreview] = useState<SummaryPreview | null>(null);

  const branchesQuery = useBranchesQuery();
  const templatesQuery = useDocumentTemplatesQuery();
  const backgroundQuery = usePatientBackgroundQuery(clinicalUuid);
  const otoscopyQuery = useOtoscopyEntriesQuery(clinicalUuid);
  const audiometryListQuery = useAudiometryEntriesQuery(clinicalUuid);

  const templates = templatesQuery.data ?? [];
  const background = backgroundQuery.data ?? null;
  const latestOtoscopy = [...(otoscopyQuery.data ?? [])].sort(byNewest)[0] ?? null;
  const audiometryList = audiometryListQuery.data ?? [];
  const validAudiometries = filterValidAudiometries(audiometryList);
  // Lo elegido se contrasta con las válidas actuales: una marcada como mal hecha en otra pestaña
  // sale de la selección apenas se refresca la lista.
  const validAudiometryUuids = new Set(validAudiometries.map((entry) => entry.uuid));
  const audiometryUuids =
    chosenAudiometryUuids?.filter((uuid) => validAudiometryUuids.has(uuid)) ??
    resolveDefaultAudiometryUuids(audiometryList);
  const latestValidAudiometryUuid = resolveDefaultAudiometryUuids(audiometryList)[0] ?? null;
  const hasTemplatesChosen = checked[SummaryCard.TEMPLATES] && templateUuids.length > 0;

  // Las variables de diagnóstico, observaciones y clínica salen de la última audiometría válida
  // y de la clínica, no de lo elegido en las tarjetas: se piden solo si hay plantillas elegidas.
  const clinicQuery = useTenantQuery({ enabled: hasTemplatesChosen });
  const latestAudiometryQuery = useAudiometryEntryQuery(
    hasTemplatesChosen ? clinicalUuid : '',
    latestValidAudiometryUuid,
  );

  // El detalle de las audiometrías y el contenido de las plantillas se piden solo si se eligen.
  const audiometryDetailQueries = useAudiometryEntriesDetailQueries(
    clinicalUuid,
    checked[SummaryCard.AUDIOMETRY] ? audiometryUuids : [],
  );
  const templateContentQueries = useDocumentTemplatesContentQueries(
    checked[SummaryCard.TEMPLATES] ? templateUuids : [],
  );

  const failedContentQueries = checked[SummaryCard.TEMPLATES]
    ? templateContentQueries.filter((query) => query.isError)
    : [];
  const failedAudiometryQueries = checked[SummaryCard.AUDIOMETRY]
    ? audiometryDetailQueries.filter((query) => query.isError)
    : [];
  const isAudiometryDetailFailed = failedAudiometryQueries.length > 0;
  // Sin la clínica o la última audiometría las variables saldrían vacías: se bloquea y se reintenta.
  const isTemplateContextFailed =
    hasTemplatesChosen && (clinicQuery.isError || latestAudiometryQuery.isError);

  // Las sedes no son una tarjeta: si fallan, la ficha sale sin ellas y no se bloquea nada.
  const cardStates: SummaryCardState[] = [
    {
      card: SummaryCard.TECHNICAL_SHEET,
      isAvailable: true,
      isChecked: checked[SummaryCard.TECHNICAL_SHEET],
      isLoading: false,
      isError: false,
      onRetry: () => undefined,
    },
    {
      card: SummaryCard.TEMPLATES,
      isAvailable: templates.length > 0,
      isChecked: checked[SummaryCard.TEMPLATES],
      isLoading: templatesQuery.isLoading,
      isError:
        templatesQuery.isError || failedContentQueries.length > 0 || isTemplateContextFailed,
      onRetry: () => {
        if (templatesQuery.isError) void templatesQuery.refetch();
        failedContentQueries.forEach((query) => void query.refetch());
        if (hasTemplatesChosen && clinicQuery.isError) void clinicQuery.refetch();
        if (hasTemplatesChosen && latestAudiometryQuery.isError) {
          void latestAudiometryQuery.refetch();
        }
      },
    },
    ...(canViewClinical
      ? [
          {
            card: SummaryCard.BACKGROUND,
            isAvailable: background !== null,
            isChecked: checked[SummaryCard.BACKGROUND],
            isLoading: backgroundQuery.isLoading,
            isError: backgroundQuery.isError,
            onRetry: () => void backgroundQuery.refetch(),
          },
          {
            card: SummaryCard.OTOSCOPY,
            isAvailable: latestOtoscopy !== null,
            isChecked: checked[SummaryCard.OTOSCOPY],
            isLoading: otoscopyQuery.isLoading,
            isError: otoscopyQuery.isError,
            onRetry: () => void otoscopyQuery.refetch(),
          },
          {
            card: SummaryCard.AUDIOMETRY,
            isAvailable: validAudiometries.length > 0,
            isChecked: checked[SummaryCard.AUDIOMETRY],
            isLoading: audiometryListQuery.isLoading,
            isError: audiometryListQuery.isError || isAudiometryDetailFailed,
            onRetry: () => {
              if (audiometryListQuery.isError) void audiometryListQuery.refetch();
              failedAudiometryQueries.forEach((query) => void query.refetch());
            },
          },
        ]
      : []),
  ];

  const hasError = cardStates.some((state) => state.isError);
  const failureCount = [
    templatesQuery,
    clinicQuery,
    latestAudiometryQuery,
    backgroundQuery,
    otoscopyQuery,
    audiometryListQuery,
    ...audiometryDetailQueries,
    ...templateContentQueries,
  ].reduce((total, query) => total + query.failureCount, 0);

  useEffect(() => {
    if (hasError) toast.error(t(SUMMARY_TEXT.LOAD_ERROR));
  }, [hasError, failureCount, t]);

  // Una tarjeta marcada con su consulta caída bloquea generar; una sin marcar no estorba.
  const hasChosenError =
    cardStates.some((state) => state.isChecked && state.isError) || isTemplateContextFailed;

  const toggleCard = (card: SummaryCard, isChecked: boolean) =>
    setChecked((current) => ({ ...current, [card]: isChecked }));

  const isLoadingChosen =
    (checked[SummaryCard.TEMPLATES] && templateContentQueries.some((query) => query.isLoading)) ||
    (checked[SummaryCard.AUDIOMETRY] && audiometryDetailQueries.some((query) => query.isLoading)) ||
    (hasTemplatesChosen && (clinicQuery.isLoading || latestAudiometryQuery.isLoading));
  const isTemplatesIncomplete = checked[SummaryCard.TEMPLATES] && templateUuids.length === 0;
  const isAudiometryIncomplete = checked[SummaryCard.AUDIOMETRY] && audiometryUuids.length === 0;
  const hasSomething =
    checked[SummaryCard.TECHNICAL_SHEET] ||
    hasTemplatesChosen ||
    checked[SummaryCard.BACKGROUND] ||
    checked[SummaryCard.OTOSCOPY] ||
    checked[SummaryCard.AUDIOMETRY];
  const canGenerate =
    hasSomething &&
    !isTemplatesIncomplete &&
    !isAudiometryIncomplete &&
    !isLoadingChosen &&
    !hasChosenError &&
    preview === null;

  const branchNames = useMemo(
    () =>
      getPatientBranchUuids(patient)
        .map((branchUuid) => branchesQuery.data?.find((branch) => branch.uuid === branchUuid)?.name)
        .filter((name): name is string => Boolean(name)),
    [patient, branchesQuery.data],
  );

  const handleGenerate = () => {
    if (!canGenerate) return;
    const issuedAt = new Date().toISOString();
    const professionalName = user?.fullName ?? '';
    const clinicName = tenant?.businessName ?? '';
    const patientName = `${patient.firstName} ${patient.lastName}`.trim();
    const age = calculateAge(patient.birthDate);

    const values = buildTemplateValues({
      patient,
      branchNames,
      professionalName,
      ageText: age !== null ? t(TEXT.PATIENTS.DETAIL.AGE, { count: age }) : '',
      issuedAt,
      latestOtoscopy,
      latestAudiometryNotes: latestAudiometryQuery.data?.payload.notes ?? null,
      clinic: clinicQuery.data ?? null,
    });
    const chosenTemplates = hasTemplatesChosen
      ? templateContentQueries.flatMap((query) =>
          query.data
            ? [
                {
                  uuid: query.data.uuid,
                  name: query.data.name,
                  content: query.data.content,
                },
              ]
            : [],
        )
      : [];

    const header: PrintReportHeader = {
      clinicName,
      clinicLogoUrl: tenant?.logoUrl ?? null,
      patientName,
      patientDocumentId: patient.documentId ?? '',
      patientAge: age,
      patientBirthDate: formatCalendarDate(patient.birthDate),
    };
    const chosenAudiometries = checked[SummaryCard.AUDIOMETRY]
      ? resolveSelectedAudiometries(
          audiometryDetailQueries.flatMap((query) => (query.data ? [query.data] : [])),
          audiometryUuids,
        )
      : [];

    const props: PatientSummaryPrintProps = {
      tenant: { name: clinicName, logoUrl: tenant?.logoUrl ?? null },
      summaryPatient: { patient, branchNames },
      issuedAt,
      professionalName,
      showPatientSheet: checked[SummaryCard.TECHNICAL_SHEET],
      templates: chosenTemplates,
      templateValues: values,
      background:
        checked[SummaryCard.BACKGROUND] && background
          ? {
              background,
              authorName: resolveKnownAuthor(
                user,
                background.updatedByUuid ?? background.createdByUuid ?? '',
              ),
            }
          : null,
      otoscopy: checked[SummaryCard.OTOSCOPY] ? latestOtoscopy : null,
      audiometries: chosenAudiometries.map((audiometryEntry) =>
        buildSummaryAudiometry(
          audiometryEntry,
          header,
          resolveKnownAuthor(
            user,
            audiometryEntry.createdByUuid ?? '',
            audiometryEntry.createdByName,
          ),
        ),
      ),
    };

    setPreview({
      printProps: props,
      fileName: buildPrintFileName({
        type: t(SUMMARY_TEXT.FILE_TYPE.SUMMARY),
        clinic: clinicName,
        patient: patientName,
        documentId: patient.documentId,
      }),
    });
  };

  const audiometryDateLabels = buildEntryDateLabels(
    validAudiometries,
    formatDateTime,
    buildEntryWithPtaLabel(t),
  );
  const audiometryOptions: AudiometryOption[] = [...validAudiometries]
    .sort(byNewest)
    .map((entry) => {
      const date = audiometryDateLabels.get(entry.uuid) ?? formatDateTime(entry.createdAt);
      const author = resolveKnownAuthor(user, entry.createdByUuid ?? '', entry.createdByName);
      return {
        value: entry.uuid,
        label: author ? t(SUMMARY_TEXT.AUDIOMETRY_OPTION, { date, author }) : date,
      };
    });

  return {
    cardStates,
    templates,
    templateUuids,
    audiometryOptions,
    audiometryUuids,
    changeAudiometries: setChosenAudiometryUuids,
    toggleCard,
    changeTemplates: setTemplateUuids,
    isLoadingChosen,
    canGenerate,
    handleGenerate,
    preview,
    closePreview: () => setPreview(null),
  };
}
