import React, { useEffect } from 'react';
import { Form, Formik, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { FormField } from '@/components/common/input/input';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AUDIOMETRY_NOTES_MAX_LENGTH, AudiometryNotes } from './audiometry-constants';
import { ReadOnlyValue } from './audiometry-read-only-value';

const NOTES_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY.NOTES;

interface NotesSyncProps {
  onChange: (notes: AudiometryNotes) => void;
}

/** FormField vive sobre Formik: este efecto devuelve lo escrito al estado del hook. */
const NotesSync: React.FC<NotesSyncProps> = ({ onChange }) => {
  const { values } = useFormikContext<AudiometryNotes>();
  useEffect(() => {
    onChange(values);
  }, [values, onChange]);
  return null;
};

interface AudiometryNotesFieldsProps {
  notes: AudiometryNotes;
  onNotesChange: (notes: AudiometryNotes) => void;
  isReadOnly?: boolean;
  /** El rastreo solo lleva observaciones. */
  hasDiagnosis?: boolean;
}

export const AudiometryNotesFields: React.FC<AudiometryNotesFieldsProps> = ({
  notes,
  onNotesChange,
  isReadOnly = false,
  hasDiagnosis = true,
}) => {
  const { t } = useTranslation();

  const gridClasses = tailwind(
    'grid grid-cols-1 gap-6 border-t border-ink-100 pt-6',
    hasDiagnosis && 'md:grid-cols-2',
  );

  if (isReadOnly) {
    return (
      <dl className={gridClasses}>
        {hasDiagnosis && (
          <div className="flex min-w-0 flex-col gap-1.5">
            <dt className="text-sm font-medium text-ink-700 md:text-base">
              {t(NOTES_TEXT.DIAGNOSIS_TITLE)}
            </dt>
            <dd>
              <ReadOnlyValue
                value={notes.diagnosis}
                className="block whitespace-pre-wrap break-words text-sm text-ink-900 md:text-base"
              />
            </dd>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <dt className="text-sm font-medium text-ink-700 md:text-base">
            {t(NOTES_TEXT.OBSERVATIONS_TITLE)}
          </dt>
          <dd>
            <ReadOnlyValue
              value={notes.observations}
              className="block whitespace-pre-wrap break-words text-sm text-ink-900 md:text-base"
            />
          </dd>
        </div>
      </dl>
    );
  }

  return (
    <Formik initialValues={notes} onSubmit={() => undefined}>
      <Form className={gridClasses}>
        <NotesSync onChange={onNotesChange} />
        {hasDiagnosis && (
          <FormField
            as="textarea"
            name="diagnosis"
            label={t(NOTES_TEXT.DIAGNOSIS_TITLE)}
            maxLength={AUDIOMETRY_NOTES_MAX_LENGTH}
            showCount
          />
        )}
        <FormField
          as="textarea"
          name="observations"
          label={t(NOTES_TEXT.OBSERVATIONS_TITLE)}
          maxLength={AUDIOMETRY_NOTES_MAX_LENGTH}
          showCount
        />
      </Form>
    </Formik>
  );
};
