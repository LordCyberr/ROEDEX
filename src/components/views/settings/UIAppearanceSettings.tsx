import React from 'react';
import { SliderRow } from './SettingsControls';
import { useTranslation } from '../../../hooks/useTranslation';

interface UIAppearanceSettingsProps {
  settings: {
    width?: number;
    height?: number;
    scale?: number;
    opacity?: number;
    duration?: number;
  };
  onUpdate: (updates: any) => void;
  showDuration?: boolean;
  widthRange?: [number, number];
  heightRange?: [number, number];
}

export const UIAppearanceSettings: React.FC<UIAppearanceSettingsProps> = ({ 
  settings, 
  onUpdate, 
  showDuration = false,
  widthRange = [20, 400],
  heightRange = [2, 120]
}) => {
  const { t } = useTranslation();
  return (
    <>
      {settings.width !== undefined && (
        <SliderRow label={t('settings.barWidth') || 'Width'} value={settings.width} min={widthRange[0]} max={widthRange[1]} step={10} display={`${settings.width}px`} onChange={(v) => onUpdate({ width: v })} />
      )}
      {settings.height !== undefined && (
        <SliderRow label={t('settings.barHeight') || 'Height'} value={settings.height} min={heightRange[0]} max={heightRange[1]} step={2} display={`${settings.height}px`} onChange={(v) => onUpdate({ height: v })} />
      )}
      {settings.scale !== undefined && (
        <SliderRow label={t('settings.scale') || 'Scale'} value={settings.scale} min={0.5} max={1.5} step={0.1} display={`${(settings.scale * 100).toFixed(0)}%`} onChange={(v) => onUpdate({ scale: v })} />
      )}
      {settings.opacity !== undefined && (
        <SliderRow label={t('settings.opacity') || 'Opacity'} value={settings.opacity} min={0.1} max={1} step={0.05} display={`${(settings.opacity * 100).toFixed(0)}%`} onChange={(v) => onUpdate({ opacity: v })} />
      )}
      {showDuration && settings.duration !== undefined && (
        <SliderRow label={t('settings.toastDuration') || 'Duration'} value={settings.duration} min={1000} max={10000} step={500} display={`${(settings.duration / 1000).toFixed(1)}s`} onChange={(v) => onUpdate({ duration: v })} />
      )}
    </>
  );
};
