import React, { useState } from 'react';
import { ListPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { inputBaseClasses } from '@/components/common/input/input';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { useEscapeKey } from '@/hooks/use-escape-key';
import { TEXT } from '@/static/texts/i18n';
import { QUESTIONNAIRE_NAME_MAX_LENGTH } from '@/types/clinical-templates/clinical-template';

interface NewQuestionnaireSectionModalProps {
  onConfirm: (name: string) => void;
  onClose: () => void;
}

const NAME_ID = 'new-questionnaire-section-name';

/** Pide solo el nombre; las preguntas se arman después en el editor de la sección. */
export const NewQuestionnaireSectionModal: React.FC<NewQuestionnaireSectionModalProps> = ({
  onConfirm,
  onClose,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  useEscapeKey(onClose);

  const trimmedName = name.trim();
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (trimmedName) onConfirm(trimmedName);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(TEXT.QUESTIONS.NEW_SECTION_TITLE)}
      // En el celular sube desde abajo, como las demás ventanas.
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <form
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-card bg-white p-5 sm:rounded-card sm:p-6"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10">
            <ListPlus className="h-5 w-5 text-brand-700" aria-hidden />
          </span>
          <Typography variant={TypographyVariant.ACCENT}>
            {t(TEXT.QUESTIONS.NEW_SECTION_TITLE)}
          </Typography>
        </div>

        <label htmlFor={NAME_ID} className="mt-5 flex flex-col gap-1.5">
          <Typography variant={TypographyVariant.BODY}>{t(TEXT.QUESTIONS.SECTION_NAME)}</Typography>
          <input
            id={NAME_ID}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={QUESTIONNAIRE_NAME_MAX_LENGTH}
            placeholder={t(TEXT.QUESTIONS.SECTION_NAME_PLACEHOLDER)}
            className={inputBaseClasses}
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant={ButtonVariant.SECONDARY} onClick={onClose}>
            {t(TEXT.GENERAL.BUTTONS.CANCEL)}
          </Button>
          <Button type="submit" variant={ButtonVariant.PRIMARY} disabled={!trimmedName}>
            {t(TEXT.QUESTIONS.SECTION_CONTINUE)}
          </Button>
        </div>
      </form>
    </div>
  );
};
