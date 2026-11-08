import { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/use-permissions';
import { useResolveAuthorLabel } from '@/hooks/use-resolve-author-label';
import { useSession } from '@/hooks/use-session';
import { useBranchesQuery } from '@/shared/api/querys/branches-query';
import {
  useDocumentTemplatesContentQueries,
  useDocumentTemplatesQuery,
} from '@/shared/api/querys/document-templates-query';
import {
  useAudiometryEntriesQuery,
  useAudiometryEntryQuery,
} from '@/shared/api/querys/patient-audiometry-entries-query';
import { usePatientBackgroundQuery } from '@/shared/api/querys/patient-background-query';
import { useOtoscopyEntriesQuery } from '@/shared/api/querys/patient-otoscopy-entries-query';
import { Permission } from '@/shared/auth/permissions';
import { fillVariables } from '@/shared/utils/document-template-text';
import { calculateAge, formatDate } from '@/shared/utils/formatters';
import { printWithFileName, waitForImages } from '@/shared/utils/print-document';
import { buildPrintFileName } from '@/shared/utils/print-file-name';
import { TEXT } from '@/static/texts/i18n';
import { Patient, getPatientBranchUuids } from '@/types/patients/patient';
import { PrintReportHeader } from '../patient-audiometry/use-audiometry-poc';
import { PatientSummaryPrintProps } from './patient-summary-print';
import { buildSummaryAudiometry, buildTemplateValues } from './summary-print-data';

const SUMMARY_TEXT = TEXT.PATIENTS.CLINICAL_SUMMARY;

export enum SummaryCard {
  TEMPLATES = 'TEMPLATES',
  BACKGROUND = 'BACKGROUND',
  OTOSCOPY = 'OTOSCOPY',
  AUDIOMETRY = 'AUDIOMETRY',
}

export interface SummaryCardState {
  card: SummaryCard;
  isAvailable: boolean;
  isChecked: boolean;
  isLoading: boolean;
}

const byNewest = <T extends { createdAt: string }>(a: T, b: T) =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

export function usePatientSummary(patient: Patient) {
  const { t } = useTranslation();
  const { user, tenant } = useSession();
  const { can } = usePermissions();
  const resolveAuthorLabel = useResolveAuthorLabel();
  const canViewClinical = can(Permission.VIEW_CLINICAL_RECORD);
  // Sin uuid las consultas clínicas no se hacen: un rol sin acceso no las pide.
  const clinicalUuid = canViewClinical ? patient.uuid : '';

  const [checked, setChecked] = useState<Record<SummaryCard, boolean>>({
    [SummaryCard.TEMPLATES]: false,
    [SummaryCard.BACKGROUND]: false,
    [SummaryCard.OTOSCOPY]: false,
    [SummaryCard.AUDIOMETRY]: false,
  });
  const [templateUuids, setTemplateUuids] = useState<string[]>([]);
  const [printProps, setPrintProps] = useState<PatientSummaryPrintProps | null>(null);

  const branchesQuery = useBranchesQuery();
  const templatesQuery = useDocumentTemplatesQuery();
  const backgroundQuery = usePatientBackgroundQuery(clinicalUuid);
  const otoscopyQuery = useOtoscopyEntriesQuery(clinicalUuid);
  const audiometryListQuery = useAudiometryEntriesQuery(clinicalUuid);

  const templates = templatesQuery.data ?? [];
  const background = backgroundQuery.data ?? null;
  const latestOtoscopy = [...(otoscopyQuery.data ?? [])].sort(byNewest)[0] ?? null;
  const latestAudiometryUuid =
    [...(audiometryListQuery.data ?? [])].sort(byNewest)[0]?.uuid ?? null;

  // El detalle de la audiometría y el contenido de las plantillas se piden solo si se eligen.
  const audiometryQuery = useAudiometryEntryQuery(
    clinicalUuid,
    checked[SummaryCard.AUDIOMETRY] ? latestAudiometryUuid : null,
  );
  const templateContentQueries = useDocumentTemplatesContentQueries(
    checked[SummaryCard.TEMPLATES] ? templateUuids : [],
  );

  const listQueries = [
    templatesQuery,
    branchesQuery,
    ...(canViewClinical ? [backgroundQuery, otoscopyQuery, audiometryListQuery] : []),
  ];
  const failedQueries = [...listQueries, audiometryQuery, ...templateContentQueries].filter(
    (query) => query.isError,
  );
  const hasError = failedQueries.length > 0;
  const failureCount = failedQueries.reduce((total, query) => total + query.failureCount, 0);

  useEffect(() => {
    if (hasError) toast.error(t(SUMMARY_TEXT.LOAD_ERROR));
  }, [hasError, failureCount, t]);

  const retry = () => failedQueries.forEach((query) => void query.refetch());

  const cardStates: SummaryCardState[] = [
    {
      card: SummaryCard.TEMPLATES,
      isAvailable: templates.length > 0,
      isChecked: checked[SummaryCard.TEMPLATES],
      isLoading: templatesQuery.isLoading,
    },
    ...(canViewClinical
      ? [
          {
            card: SummaryCard.BACKGROUND,
            isAvailable: background !== null,
            isChecked: checked[SummaryCard.BACKGROUND],
            isLoading: backgroundQuery.isLoading,
          },
          {
            card: SummaryCard.OTOSCOPY,
            isAvailable: latestOtoscopy !== null,
            isChecked: checked[SummaryCard.OTOSCOPY],
            isLoading: otoscopyQuery.isLoading,
          },
          {
            card: SummaryCard.AUDIOMETRY,
            isAvailable: latestAudiometryUuid !== null,
            isChecked: checked[SummaryCard.AUDIOMETRY],
            isLoading: audiometryListQuery.isLoading,
          },
        ]
      : []),
  ];

  const toggleCard = (card: SummaryCard, isChecked: boolean) =>
    setChecked((current) => ({ ...current, [card]: isChecked }));

  const toggleTemplate = (templateUuid: string, isChecked: boolean) =>
    setTemplateUuids((current) =>
      isChecked ? [...current, templateUuid] : current.filter((uuid) => uuid !== templateUuid),
    );

  const isLoadingChosen =
    (checked[SummaryCard.TEMPLATES] && templateContentQueries.some((query) => query.isLoading)) ||
    (checked[SummaryCard.AUDIOMETRY] && audiometryQuery.isLoading);
  const hasTemplatesChosen = checked[SummaryCard.TEMPLATES] && templateUuids.length > 0;
  const isTemplatesIncomplete = checked[SummaryCard.TEMPLATES] && templateUuids.length === 0;
  const hasSomething =
    hasTemplatesChosen ||
    checked[SummaryCard.BACKGROUND] ||
    checked[SummaryCard.OTOSCOPY] ||
    checked[SummaryCard.AUDIOMETRY];
  const isGenerating = printProps !== null;
  const canGenerate =
    hasSomething && !isTemplatesIncomplete && !isLoadingChosen && !hasError && !isGenerating;

  const branchNames = useMemo(
    () =>
      getPatientBranchUuids(patient)
        .map((branchUuid) => branchesQuery.data?.find((branch) => branch.uuid === branchUuid)?.name)
        .filter((name): name is string => Boolean(name)),
    [patient, branchesQuery.data],
  );

  const handleGenerate = async () => {
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
    });
    const filledTemplates = hasTemplatesChosen
      ? templateContentQueries.flatMap((query) =>
          query.data
            ? [
                {
                  uuid: query.data.uuid,
                  name: query.data.name,
                  content: fillVariables(query.data.content, values),
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
      patientBirthDate: patient.birthDate ? formatDate(patient.birthDate) : '',
    };
    const audiometryEntry = audiometryQuery.data;

    const props: PatientSummaryPrintProps = {
      tenant: { name: clinicName, logoUrl: tenant?.logoUrl ?? null },
      summaryPatient: { patient, branchNames },
      issuedAt,
      professionalName,
      templates: filledTemplates,
      background:
        checked[SummaryCard.BACKGROUND] && background
          ? {
              background,
              authorName: resolveAuthorLabel(
                background.updatedByUuid ?? background.createdByUuid ?? '',
              ),
            }
          : null,
      otoscopy: checked[SummaryCard.OTOSCOPY] ? latestOtoscopy : null,
      audiometry:
        checked[SummaryCard.AUDIOMETRY] && audiometryEntry
          ? buildSummaryAudiometry(
              audiometryEntry,
              header,
              resolveAuthorLabel(
                audiometryEntry.createdByUuid ?? '',
                audiometryEntry.createdByName,
              ),
            )
          : null,
    };

    // Se monta ya pintado y, tras un par de cuadros e imágenes cargadas, se abre la impresión.
    flushSync(() => setPrintProps(props));
    await nextFrame();
    await nextFrame();
    await waitForImages(document);
    printWithFileName(
      buildPrintFileName({
        type: t(SUMMARY_TEXT.FILE_TYPE.SUMMARY),
        clinic: clinicName,
        patient: patientName,
        documentId: patient.documentId,
      }),
      () => setPrintProps(null),
    );
  };

  return {
    cardStates,
    templates,
    templateUuids,
    toggleCard,
    toggleTemplate,
    isLoadingLists: listQueries.some((query) => query.isLoading),
    isLoadingChosen,
    hasError,
    retry,
    canGenerate,
    isGenerating,
    handleGenerate,
    printProps,
  };
}
