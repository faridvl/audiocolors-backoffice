import React from 'react';
import { Ban, Plus, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ActionMenu } from '@/components/common/action-menu/action-menu';
import { Accordion, AccordionVariant } from '@/components/common/accordion/accordion';
import { Button, ButtonVariant } from '@/components/common/button/button';
import { ConfirmDialog } from '@/components/common/confirm-dialog/confirm-dialog';
import { Typography, TypographyVariant } from '@/components/common/typography/typography';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AudiogramChart } from './audiogram-chart';
import { AudiometryLegend } from './audiometry-legend';
import { AudiometrySummary } from './audiometry-summary';
import { AudiometryToolbar } from './audiometry-toolbar';
import { AudiometryTool, AudiometryTypeCode, EARS, Ear } from './audiometry-constants';
import { EAR_LABEL_KEYS } from './audiometry-labels';
import { GradeLabelsCenter } from './grade-labels-column';
import { WeberTest } from './weber-test';
import { AudiometryNotesFields } from './audiometry-notes';
import { AudiometryStatusStrip, StatusStripTone } from './audiometry-status-strip';
import { AudiometryPrintReport } from './audiometry-print-report';
import { InvalidateAudiometryModal } from './invalidate-audiometry-modal';
import { ScreeningResultField } from './screening-result-field';
import { SpeechWordList } from './speech-word-list';
import { SpeechWordListSelectors } from './speech-word-list-selectors';
import { SpeechAudiogramChart } from './speech-audiogram-chart';
import { NEW_ENTRY_OPTION_VALUE, useAudiometryPoc } from './use-audiometry-poc';
import { formatDateTime } from '@/shared/utils/formatters';
import { PillSelect, PillSelectVariant } from '@/components/common/pill-select/pill-select';

const AUDIOMETRY_TEXT = TEXT.PATIENTS.DETAIL.AUDIOMETRY;

// El oído derecho se dibuja a la derecha, como se ve al paciente de frente.
const AUDIOGRAM_EARS: Ear[] = [Ear.LEFT, Ear.RIGHT];
// La columna con los grados va entre los dos audiogramas.
const CENTER_COLUMN_INDEX = 1;

interface PatientAudiometryContainerProps {
  patientUuid: string;
}

export const PatientAudiometryContainer: React.FC<PatientAudiometryContainerProps> = ({
  patientUuid,
}) => {
  const { t } = useTranslation();
  const {
    accordionRef,
    isJustSaved,
    isReadOnly,
    activeType,
    typeOptions,
    isScreening,
    screeningResult,
    isResultMissing,
    handleScreeningResultChange,
    pendingType,
    handleTypeChange,
    handleConfirmTypeChange,
    handleCancelTypeChange,
    printReportHeader,
    handlePrint,
    isSaving,
    canSave,
    handleSave,
    formVersion,
    entryOptions,
    selectedEntryValue,
    selectedEntry,
    selectedEntryAuthor,
    handleSelectEntry,
    invalidationNotice,
    canInvalidate,
    isInvalidateModalOpen,
    isInvalidating,
    handleOpenInvalidateModal,
    handleCloseInvalidateModal,
    handleInvalidate,
    isLoadingEntry,
    isExpanded,
    marks,
    speechMarks,
    weber,
    speechFieldValues,
    failedWords,
    presentedWords,
    handleFailedWordsChange,
    wordListType,
    wordListId,
    setWordListId,
    handleWordListTypeChange,
    handleHideWordList,
    notes,
    setNotes,
    activeTool,
    isMasked,
    canMask,
    hasNoResponse,
    speechEar,
    summaries,
    ptaType,
    setPtaType,
    gradingScale,
    setGradingScale,
    setActiveTool,
    setSpeechEar,
    handleToggleExpanded,
    handleToggleMasked,
    handleToggleNoResponse,
    handlePlaceMark,
    handleRemoveMark,
    handleClearAudiogram,
    handlePlaceSpeech,
    handleRemoveSpeech,
    handleClearSpeech,
    handleWeberChange,
    handleSpeechFieldChange,
  } = useAudiometryPoc(patientUuid);

  const historyOptions = [
    { value: NEW_ENTRY_OPTION_VALUE, label: t(AUDIOMETRY_TEXT.NEW_ENTRY) },
    ...entryOptions,
  ];

  const entryAuthorDate = selectedEntry
    ? t(AUDIOMETRY_TEXT.ENTRY_AUTHOR_DATE, {
        author: selectedEntryAuthor,
        date: formatDateTime(selectedEntry.createdAt),
      })
    : '';

  return (
    <>
      <div ref={accordionRef} className="scroll-mt-20">
        <Accordion
          variant={AccordionVariant.CARD}
          title={t(AUDIOMETRY_TEXT.TITLE)}
          stacksActionBelowLg
          action={
            <div className="flex flex-col gap-1 lg:items-end">
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <PillSelect
                  variant={PillSelectVariant.PILL}
                  ariaLabel={t(AUDIOMETRY_TEXT.HISTORY_ARIA)}
                  value={selectedEntryValue}
                  options={historyOptions}
                  onChange={handleSelectEntry}
                  isSheetOnMobile
                  isLabelFull
                  className="min-w-0 lg:w-auto lg:min-w-64"
                />
                {selectedEntry && (
                  <Button
                    variant={ButtonVariant.SECONDARY}
                    onClick={() => handleSelectEntry(NEW_ENTRY_OPTION_VALUE)}
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {t(AUDIOMETRY_TEXT.NEW_ENTRY_BUTTON)}
                  </Button>
                )}
                {selectedEntry && !isScreening && (
                  <Button variant={ButtonVariant.SECONDARY} onClick={handlePrint}>
                    <Printer className="h-4 w-4" aria-hidden />
                    {t(AUDIOMETRY_TEXT.PRINT)}
                  </Button>
                )}
                {selectedEntry && canInvalidate && (
                  <ActionMenu
                    ariaLabel={t(AUDIOMETRY_TEXT.INVALIDATE.MENU_ARIA)}
                    items={[
                      {
                        label: t(AUDIOMETRY_TEXT.INVALIDATE.BUTTON),
                        icon: <Ban className="h-4 w-4" aria-hidden />,
                        isDanger: true,
                        onClick: handleOpenInvalidateModal,
                      },
                    ]}
                  />
                )}
              </div>
              {selectedEntry && (
                <Typography variant={TypographyVariant.HELPER}>{entryAuthorDate}</Typography>
              )}
            </div>
          }
          isExpanded={isExpanded}
          onToggle={handleToggleExpanded}
        >
          {isLoadingEntry ? (
            <Typography variant={TypographyVariant.BODY}>
              {t(AUDIOMETRY_TEXT.ENTRY_LOADING)}
            </Typography>
          ) : (
            <div className="flex flex-col gap-6">
              {isJustSaved && (
                <AudiometryStatusStrip
                  tone={StatusStripTone.SUCCESS}
                  message={t(AUDIOMETRY_TEXT.SAVED_BANNER, {
                    author: selectedEntryAuthor,
                    date: selectedEntry ? formatDateTime(selectedEntry.createdAt) : '',
                  })}
                />
              )}
              {invalidationNotice && (
                <AudiometryStatusStrip
                  tone={StatusStripTone.WARNING}
                  message={t(AUDIOMETRY_TEXT.INVALIDATE.BANNER, {
                    author: invalidationNotice.author,
                    date: invalidationNotice.date,
                  })}
                  detail={t(AUDIOMETRY_TEXT.INVALIDATE.BANNER_REASON, {
                    reason: invalidationNotice.reason,
                  })}
                />
              )}
              {isReadOnly && !invalidationNotice && (
                <AudiometryStatusStrip
                  tone={StatusStripTone.INFO}
                  message={t(AUDIOMETRY_TEXT.READ_ONLY_NOTICE)}
                />
              )}
              {!isReadOnly && (
                <div className="flex max-w-sm flex-col gap-1.5">
                  <Typography variant={TypographyVariant.ACCENT}>
                    {t(AUDIOMETRY_TEXT.TYPE.LABEL)}
                  </Typography>
                  <PillSelect
                    variant={PillSelectVariant.FIELD}
                    ariaLabel={t(AUDIOMETRY_TEXT.TYPE.LABEL)}
                    value={activeType}
                    options={typeOptions}
                    onChange={(value) => handleTypeChange(value as AudiometryTypeCode)}
                    isSheetOnMobile
                    isLabelFull
                  />
                </div>
              )}
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <Typography variant={TypographyVariant.SUBTITLE}>
                    {t(AUDIOMETRY_TEXT.AUDIOGRAM_TITLE)}
                  </Typography>
                  {!isReadOnly && (
                    <Button variant={ButtonVariant.SECONDARY} onClick={handleClearAudiogram}>
                      {t(AUDIOMETRY_TEXT.CLEAR_AUDIOGRAM)}
                    </Button>
                  )}
                </div>
                {!isReadOnly && (
                  <AudiometryToolbar
                    activeTool={activeTool}
                    isMasked={isMasked}
                    canMask={canMask}
                    hasNoResponse={hasNoResponse}
                    isScreening={isScreening}
                    onSelectTool={setActiveTool}
                    onToggleMasked={handleToggleMasked}
                    onToggleNoResponse={handleToggleNoResponse}
                  />
                )}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr]">
                  {AUDIOGRAM_EARS.map((ear, index) => (
                    <React.Fragment key={ear}>
                      {index === CENTER_COLUMN_INDEX && (
                        <GradeLabelsCenter gradingScale={gradingScale} />
                      )}
                      <AudiogramChart
                        ear={ear}
                        marks={marks}
                        activeTool={isScreening ? AudiometryTool.AIR : activeTool}
                        gradingScale={gradingScale}
                        onPlace={handlePlaceMark}
                        onRemove={handleRemoveMark}
                        isReadOnly={isReadOnly}
                      />
                    </React.Fragment>
                  ))}
                </div>
                {!isScreening && (
                  <>
                    <WeberTest
                      weber={weber}
                      onWeberChange={handleWeberChange}
                      isReadOnly={isReadOnly}
                    />
                    <AudiometryLegend />
                  </>
                )}
              </section>

              {isScreening && (
                <ScreeningResultField
                  result={screeningResult}
                  onResultChange={handleScreeningResultChange}
                  isMissing={isResultMissing}
                  isReadOnly={isReadOnly}
                />
              )}

              {!isScreening && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                  <section className="flex min-w-0 flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <Typography variant={TypographyVariant.SUBTITLE}>
                        {t(AUDIOMETRY_TEXT.SPEECH.TITLE)}
                      </Typography>
                      {!isReadOnly && (
                        <Button variant={ButtonVariant.SECONDARY} onClick={handleClearSpeech}>
                          {t(AUDIOMETRY_TEXT.CLEAR_SPEECH)}
                        </Button>
                      )}
                    </div>
                    <SpeechWordListSelectors
                      wordListType={wordListType}
                      wordListId={wordListId}
                      onWordListTypeChange={handleWordListTypeChange}
                      onWordListChange={setWordListId}
                      isReadOnly={isReadOnly}
                    />
                    {!isReadOnly && (
                      <div
                        role="group"
                        aria-label={t(AUDIOMETRY_TEXT.SPEECH.EAR_LABEL)}
                        className="flex flex-wrap gap-2"
                      >
                        {EARS.map((ear: Ear) => (
                          <button
                            key={ear}
                            type="button"
                            aria-pressed={ear === speechEar}
                            onClick={() => setSpeechEar(ear)}
                            className={tailwind(
                              'min-h-[44px] rounded-lg border px-4 text-sm font-medium transition-colors',
                              ear === speechEar
                                ? 'border-brand bg-brand-50 text-brand-700'
                                : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                            )}
                          >
                            {t(EAR_LABEL_KEYS[ear])}
                          </button>
                        ))}
                      </div>
                    )}
                    <div>
                      <SpeechAudiogramChart
                        marks={speechMarks}
                        activeEar={speechEar}
                        onPlace={handlePlaceSpeech}
                        onRemove={handleRemoveSpeech}
                        isReadOnly={isReadOnly}
                      />
                    </div>
                    <p className="flex items-center gap-2 text-xs text-ink-500">
                      <span aria-hidden className="inline-block h-0.5 w-6 bg-ink-400" />
                      {t(AUDIOMETRY_TEXT.SPEECH.NORMAL_CURVE)}
                    </p>
                  </section>

                  <div className="flex min-w-0 flex-col gap-6">
                    {wordListType && wordListId && (
                      <SpeechWordList
                        wordListType={wordListType}
                        wordListId={wordListId}
                        onHide={handleHideWordList}
                      />
                    )}
                    <AudiometrySummary
                      summaries={summaries}
                      ptaType={ptaType}
                      onPtaTypeChange={setPtaType}
                      gradingScale={gradingScale}
                      onGradingScaleChange={setGradingScale}
                      speechFieldValues={speechFieldValues}
                      onSpeechFieldChange={handleSpeechFieldChange}
                      failedWords={failedWords}
                      presentedWords={presentedWords}
                      onFailedWordsChange={handleFailedWordsChange}
                      isReadOnly={isReadOnly}
                    />
                  </div>
                </div>
              )}

              <AudiometryNotesFields
                key={formVersion}
                notes={notes}
                onNotesChange={setNotes}
                isReadOnly={isReadOnly}
                hasDiagnosis={!isScreening}
              />

              {!isReadOnly && (
                <div className="flex flex-col items-end gap-1">
                  <Button onClick={handleSave} disabled={!canSave} isLoading={isSaving}>
                    {t(AUDIOMETRY_TEXT.SAVE)}
                  </Button>
                  {!canSave && !isSaving && !isScreening && (
                    <Typography variant={TypographyVariant.HELPER}>
                      {t(AUDIOMETRY_TEXT.SAVE_HINT)}
                    </Typography>
                  )}
                </div>
              )}
            </div>
          )}
        </Accordion>
      </div>
      {isInvalidateModalOpen && (
        <InvalidateAudiometryModal
          isLoading={isInvalidating}
          onConfirm={handleInvalidate}
          onCancel={handleCloseInvalidateModal}
        />
      )}
      {pendingType && (
        <ConfirmDialog
          title={t(AUDIOMETRY_TEXT.TYPE.CHANGE_TITLE)}
          message={t(AUDIOMETRY_TEXT.TYPE.CHANGE_MESSAGE)}
          confirmLabel={t(AUDIOMETRY_TEXT.TYPE.CHANGE_CONFIRM)}
          cancelLabel={t(AUDIOMETRY_TEXT.TYPE.CHANGE_CANCEL)}
          onConfirm={handleConfirmTypeChange}
          onCancel={handleCancelTypeChange}
        />
      )}
      {selectedEntry && !isScreening && (
        <AudiometryPrintReport
          header={printReportHeader}
          entryDate={formatDateTime(selectedEntry.createdAt)}
          professional={selectedEntryAuthor ?? ''}
          marks={marks}
          gradingScale={gradingScale}
          speechMarks={speechMarks}
          weber={weber}
          summaries={summaries}
          ptaType={ptaType}
          speechFieldValues={speechFieldValues}
          failedWords={failedWords}
          presentedWords={presentedWords}
          notes={notes}
          invalidation={invalidationNotice}
        />
      )}
    </>
  );
};
