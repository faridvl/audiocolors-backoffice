import React from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/common/switch/switch';
import { TEXT } from '@/static/texts/i18n';
import { tailwind } from '@/utils/tailwind-utils';
import { AUDIOMETRY_TOOLS, AudiometryTool, EARS, Ear } from './audiometry-constants';
import { TOOL_LABEL_KEYS } from './audiometry-labels';
import { AudiometrySymbol } from './audiometry-symbol';

const ICON_SIZE = 24;
const ICON_CENTER = ICON_SIZE / 2;
/** Los símbolos de vía ósea van desplazados; en el ícono se centran. */
const ICON_VIEW_BOX = `0 0 ${ICON_SIZE} ${ICON_SIZE}`;

interface ToolIconProps {
  tool: AudiometryTool;
  ear: Ear;
}

const ToolIcon: React.FC<ToolIconProps> = ({ tool, ear }) => (
  <svg
    viewBox={ICON_VIEW_BOX}
    width={ICON_SIZE}
    height={ICON_SIZE}
    aria-hidden
    className="shrink-0"
  >
    <AudiometrySymbol
      tool={tool}
      ear={ear}
      isMasked={false}
      hasNoResponse={false}
      x={ICON_CENTER}
      y={ICON_CENTER}
    />
  </svg>
);

interface AudiometryToolbarProps {
  activeTool: AudiometryTool;
  isMasked: boolean;
  canMask: boolean;
  hasNoResponse: boolean;
  /** El rastreo solo marca vía aérea, sin enmascarado: no hay herramientas que elegir. */
  isScreening?: boolean;
  onSelectTool: (tool: AudiometryTool) => void;
  onToggleMasked: () => void;
  onToggleNoResponse: () => void;
}

export const AudiometryToolbar: React.FC<AudiometryToolbarProps> = ({
  activeTool,
  isMasked,
  canMask,
  hasNoResponse,
  isScreening = false,
  onSelectTool,
  onToggleMasked,
  onToggleNoResponse,
}) => {
  const { t } = useTranslation();
  const audiometryText = TEXT.PATIENTS.DETAIL.AUDIOMETRY;

  return (
    <div className="flex flex-col gap-2">
      {!isScreening && (
        <div
          role="group"
          aria-label={t(audiometryText.TOOLBAR_LABEL)}
          className="flex flex-wrap gap-2"
        >
          {AUDIOMETRY_TOOLS.map((tool) => {
            const isActive = tool === activeTool;
            return (
              <button
                key={tool}
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelectTool(tool)}
                className={tailwind(
                  'flex min-h-[44px] items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-brand bg-brand-50 text-brand-700'
                    : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
                )}
              >
                {tool === AudiometryTool.FREE_FIELD ? (
                  <ToolIcon tool={tool} ear={Ear.RIGHT} />
                ) : (
                  EARS.map((ear) => <ToolIcon key={ear} tool={tool} ear={ear} />)
                )}
                {t(TOOL_LABEL_KEYS[tool])}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap gap-x-6">
        {!isScreening && (
          <Switch
            isChecked={canMask && isMasked}
            onChange={() => canMask && onToggleMasked()}
            label={t(audiometryText.MASKED)}
            className={canMask ? undefined : 'opacity-50'}
          />
        )}
        <Switch
          isChecked={hasNoResponse}
          onChange={onToggleNoResponse}
          label={t(audiometryText.NO_RESPONSE)}
        />
      </div>
    </div>
  );
};
