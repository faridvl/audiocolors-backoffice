import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useUserAuditQuery } from '@/shared/api/querys/user-audit-query';
import { formatDateTime } from '@/shared/utils/formatters';
import { TEXT } from '@/static/texts/i18n';
import { formatAuditChange } from './user-audit-presenter';

const TEXTS = TEXT.SETTINGS.USERS.AUDIT;

interface UserAuditListProps {
  targetUuid: string;
}

/** Cambios de nivel, "atiende pacientes" y especialidades de una persona. */
export const UserAuditList: React.FC<UserAuditListProps> = ({ targetUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useUserAuditQuery(targetUuid);
  const entries = data ?? [];

  return (
    <section className="flex flex-col gap-3" aria-labelledby="user-audit-title">
      <Typography variant={TypographyVariant.SUBTITLE} as="h2" id="user-audit-title">
        {t(TEXTS.TITLE)}
      </Typography>

      {isLoading && (
        <Typography variant={TypographyVariant.HELPER}>
          {t(TEXT.GENERAL.BUTTONS.LOADING)}
        </Typography>
      )}
      {isError && <Typography variant={TypographyVariant.ERROR}>{t(TEXTS.LOAD_ERROR)}</Typography>}
      {!isLoading && !isError && entries.length === 0 && (
        <Typography variant={TypographyVariant.HELPER}>{t(TEXTS.EMPTY)}</Typography>
      )}

      {entries.length > 0 && (
        <ul className="flex flex-col divide-y divide-ink-100 rounded-lg border border-ink-100">
          {entries.map((entry) => (
            <li
              key={`${entry.createdAt}-${entry.field}`}
              className="flex flex-col gap-0.5 px-3 py-2.5"
            >
              <Typography variant={TypographyVariant.BODY} className="break-words">
                {formatAuditChange(entry, t)}
              </Typography>
              <Typography variant={TypographyVariant.HELPER}>
                {t(TEXTS.SUMMARY, {
                  actor: entry.actorName,
                  date: formatDateTime(entry.createdAt),
                })}
              </Typography>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
