import React from 'react';
import { Bell, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { formatDate } from '@/shared/utils/formatters';
import { Release } from '@/static/releases';
import { TEXT } from '@/static/texts/i18n';

interface ReleaseNotesModalProps {
  releases: Release[];
  onClose: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ releases, onClose }) => {
  const { t } = useTranslation();
  useEscapeKey(onClose);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.RELEASE_NOTES.TITLE)}
      // En el celular sube desde abajo, como las demás ventanas.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-card bg-white sm:rounded-card"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink-100 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <Bell className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <Typography variant={TypographyVariant.ACCENT} className="flex-1">
            {t(TEXT.RELEASE_NOTES.TITLE)}
          </Typography>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(TEXT.RELEASE_NOTES.CLOSE)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col divide-y divide-ink-100 overflow-y-auto">
          {releases.map((release) => (
            <section key={release.version} className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Typography variant={TypographyVariant.BODY_SEMIBOLD}>
                  {t(TEXT.RELEASE_NOTES.VERSION, { version: release.version })}
                </Typography>
                <Typography variant={TypographyVariant.HELPER} className="ml-auto">
                  {formatDate(release.publishedAt)}
                </Typography>
              </div>

              <ul className="flex flex-col gap-3">
                {release.items.map((item) => (
                  <li key={item.titleKey} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span className="flex min-w-0 flex-col">
                      <Typography variant={TypographyVariant.BODY_SEMIBOLD} inline>
                        {t(item.titleKey)}
                      </Typography>
                      <Typography variant={TypographyVariant.HELPER} inline>
                        {t(item.descriptionKey)}
                      </Typography>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};
