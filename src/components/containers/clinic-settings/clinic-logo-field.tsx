import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ClinicBrand } from '@/components/common/brand/clinic-brand';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { TENANT_LOGO_ACCEPTED_TYPES } from '@/types/tenant/tenant';
import { useClinicSettings } from './use-clinic-settings';

interface ClinicLogoFieldProps {
  logoUrl: string | null;
  clinicName: string;
  canEdit: boolean;
  logo: ReturnType<typeof useClinicSettings>['logo'];
}

const LOGO_PREVIEW_HEIGHT = 56;
const LOGO_ACCEPT = TENANT_LOGO_ACCEPTED_TYPES.join(',');
const LOGO_TEXT = TEXT.SETTINGS.CLINIC.LOGO;

export const ClinicLogoField: React.FC<ClinicLogoFieldProps> = ({
  logoUrl,
  clinicName,
  canEdit,
  logo,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2">
      <Typography variant={TypographyVariant.HELPER}>{t(LOGO_TEXT.TITLE)}</Typography>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-h-[88px] w-full items-center justify-center rounded-lg border border-dashed border-ink-200 bg-ink-50 p-3 sm:w-64">
          {logoUrl ? (
            <ClinicBrand logoUrl={logoUrl} name={clinicName} height={LOGO_PREVIEW_HEIGHT} />
          ) : (
            <Typography variant={TypographyVariant.HELPER} className="text-center">
              {t(LOGO_TEXT.EMPTY)}
            </Typography>
          )}
        </div>

        {canEdit && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant={ButtonVariant.SECONDARY}
              onClick={logo.openPicker}
              isLoading={logo.isUploading}
              disabled={logo.isBusy}
            >
              {t(logoUrl ? LOGO_TEXT.CHANGE : LOGO_TEXT.UPLOAD)}
            </Button>
            {logoUrl && (
              <Button
                type="button"
                variant={ButtonVariant.SECONDARY}
                icon={<Trash2 className="h-4 w-4" aria-hidden />}
                className="border-danger/40 text-danger-700 hover:border-danger hover:bg-danger/10"
                onClick={logo.requestRemoval}
                isLoading={logo.isRemoving}
                disabled={logo.isBusy}
              >
                {t(LOGO_TEXT.REMOVE)}
              </Button>
            )}
          </div>
        )}
      </div>

      <Typography variant={TypographyVariant.HELPER}>{t(LOGO_TEXT.HINT)}</Typography>
      {logo.error && (
        <div role="alert">
          <Typography variant={TypographyVariant.ERROR}>{logo.error}</Typography>
        </div>
      )}

      <input
        ref={logo.inputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="hidden"
        onChange={(event) => logo.handleSelected(event.target.files?.[0] ?? null)}
      />

      {logo.isConfirmingRemoval && (
        <ConfirmDialog
          title={t(LOGO_TEXT.REMOVE_TITLE)}
          message={t(LOGO_TEXT.REMOVE_MESSAGE)}
          confirmLabel={t(LOGO_TEXT.REMOVE_CONFIRM)}
          cancelLabel={t(TEXT.GENERAL.BUTTONS.CANCEL)}
          onConfirm={logo.confirmRemoval}
          onCancel={logo.cancelRemoval}
        />
      )}
    </div>
  );
};
