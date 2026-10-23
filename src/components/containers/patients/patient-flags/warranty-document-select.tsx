import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/common/badge/badge';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { DocumentPreviewModal } from '@/components/containers/documents/document-preview-modal';
import { TEXT } from '@/static/texts/i18n';
import { DocumentKind } from '@/types/documents/document.types';
import { Patient } from '@/types/patients/patient';
import { useWarrantyDocument } from './use-warranty-document';

/**
 * Garantías del paciente: el selector guarda cuál es la vigente (al elegir, como
 * los switches del modal) y la lista abre cualquiera en el visor.
 */
export const WarrantyDocumentSelect: React.FC<{ patient: Patient }> = ({ patient }) => {
  const { t } = useTranslation();
  const { options, selectedValue, hasDocuments, isLoading, handleChange, warrantyItems, preview } =
    useWarrantyDocument(patient);
  const label = t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.LABEL);

  if (isLoading) {
    return (
      <Typography variant={TypographyVariant.HELPER}>
        {t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.LOADING)}
      </Typography>
    );
  }

  if (!hasDocuments) {
    return (
      <div className="flex flex-col gap-1.5">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
          {label}
        </Typography>
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.EMPTY)}
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
          {label}
        </Typography>
        <PillSelect
          variant={PillSelectVariant.FIELD}
          value={selectedValue}
          options={options}
          onChange={handleChange}
          ariaLabel={label}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Typography variant={TypographyVariant.BODY_SEMIBOLD} as="span">
          {t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.ALL_TITLE, { count: warrantyItems.length })}
        </Typography>
        <ul className="flex flex-col gap-1.5">
          {warrantyItems.map((item) => {
            const KindIcon = item.kind === DocumentKind.IMAGE ? ImageIcon : FileText;
            return (
              <li key={item.uuid}>
                <Button
                  variant={ButtonVariant.CARD}
                  onClick={() => preview.handleOpenPreview(item)}
                  aria-label={t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.VIEW, { name: item.name })}
                  className="min-h-[52px] w-full gap-3 px-3 py-2"
                >
                  <KindIcon className="h-4 w-4 shrink-0 text-brand-700" aria-hidden />
                  <Typography as="span" className="flex min-w-0 flex-1 flex-col text-left">
                    <Typography
                      variant={TypographyVariant.BODY_SEMIBOLD}
                      inline
                      className="truncate"
                    >
                      {item.name}
                    </Typography>
                    <Typography variant={TypographyVariant.HELPER} inline>
                      {item.uploadedAtLabel}
                    </Typography>
                  </Typography>
                  {item.uuid === selectedValue && (
                    <Badge>{t(TEXT.PATIENTS.FLAGS.WARRANTY_DOCUMENT.SELECTED)}</Badge>
                  )}
                  <Eye className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
                </Button>
              </li>
            );
          })}
        </ul>
      </div>

      <DocumentPreviewModal
        document={preview.previewDocument}
        rotationDegrees={preview.previewRotationDegrees}
        onRotate={preview.handleRotatePreview}
        onClose={preview.handleClosePreview}
      />
    </div>
  );
};
