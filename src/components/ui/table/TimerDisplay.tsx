import { memo } from 'react';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { useGlobalTick } from '../../../core/tick';
import { Tooltip } from '../Tooltip';

const formatCountdown = (targetMs: number, now: number, forceMMSS: boolean = false): string => {
  const diff = targetMs - now;
  if (diff <= 0) return '0:00';
  const totalSecs = Math.floor(diff / 1000);
  const totalM = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  
  if (!forceMMSS) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }
  
  return `${totalM}:${s.toString().padStart(2, '0')}`;
};

const getTimerColor = (targetMs: number, now: number): string => {
  const diff = targetMs - now;
  if (diff <= 0) return 'text-[#00ffff]'; // Ready Cyan
  const m = Math.floor((diff / 1000) / 60);
  if (m < 5) return 'text-[#00ff9d]'; // Green
  if (m < 15) return 'text-[#ffcc00]'; // Yellow
  return 'text-[#ff9900]'; // Orange
};

export const TimerDisplay = memo(({ targetMsArray, textSmall }: { targetMsArray: number[], textSmall: string }) => {
  const { t } = useTranslation();
  const now = useGlobalTick();
  const maxTooltips = useSettingsStore(state => state.tableSettings.maxRespawnTooltips) || 5;
  const tutorialStep = useSettingsStore(state => state.notificationSettings.tutorialStep);

  // Sort ascending and filter out past timers
  let validTimers = targetMsArray.filter(target => target > now).sort((a, b) => a - b);
  
  if (tutorialStep === 3) {
    // Inject fake timers for tutorial so the spotlight has a target and the tooltip looks populated
    validTimers = [now + 35000, now + 125000, now + 185000, now + 245000, now + 420000];
  }

  if (validTimers.length === 0) return <div id="tutorial-timer-row" className={`text-right ${textSmall} text-[var(--text-muted)]`}>--</div>;

  const targetMs = validTimers[0];
  const timerStr = formatCountdown(targetMs, now, true);
  const timerColor = getTimerColor(targetMs, now);
  
  const tooltipContent = (
    <div className="flex flex-col gap-0.5 w-fit min-w-[60px]">
      <div className="text-[9px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-0.5 mb-0.5 font-bold tracking-widest uppercase text-center leading-tight">
        {t('categories.respawns')}
      </div>
      {validTimers.slice(0, maxTooltips).map((target, idx) => (
        <div key={idx} className="flex justify-between items-center text-[10px] font-mono gap-3">
          <span className="text-[var(--text-secondary)]">#{idx + 1}</span>
          <span className={getTimerColor(target, now)}>{formatCountdown(target, now)}</span>
        </div>
      ))}
      {validTimers.length > maxTooltips && (
        <div className="text-center text-[8px] text-[var(--text-muted)] italic mt-0.5">
          + {validTimers.length - maxTooltips} more
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div 
        id="tutorial-timer-row" 
        className={`text-right ${textSmall} ${timerColor} cursor-help`}
        onMouseEnter={() => useSettingsStore.getState().setHoveredTimerId('tutorial-timer-row')}
        onMouseLeave={() => useSettingsStore.getState().setHoveredTimerId(null)}
      >
        {timerStr}
      </div>
    </Tooltip>
  );
});
