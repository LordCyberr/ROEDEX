import React from 'react';
import { CustomSelect } from '../../ui/CustomSelect';
import { Tooltip } from '../../ui/Tooltip';
import { HelpCircle } from 'lucide-react';

// ── Toggle Row ─────────────────────────────────────────────────
export const ToggleRow: React.FC<{
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}> = ({ label, description, value, onChange, disabled }) => {
  return (
    <div className={`group flex items-center justify-between px-2.5 py-2 mb-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[var(--accent-primary)]/30 rounded-xl transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-1.5 mr-2 flex-1 min-w-0 pr-1">
        <span className="text-[11px] text-[var(--text-primary)] font-semibold leading-tight whitespace-normal break-words tracking-wide">{label}</span>
        {description && (
          <Tooltip content={description}>
            <HelpCircle size={10} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] cursor-help shrink-0 transition-colors" />
          </Tooltip>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <div className="relative w-9 h-5 bg-white/10 border border-white/15 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform after:duration-200 after:ease-out after:shadow-sm peer-checked:bg-gradient-to-r peer-checked:from-[var(--accent-primary)] peer-checked:to-amber-500 peer-checked:border-amber-400/50 peer-checked:shadow-[0_0_10px_rgba(245,158,11,0.3)] shadow-inner group-hover:border-[var(--accent-primary)]/40 transition-all"></div>
      </label>
    </div>
  );
};

// ── Slider Row ─────────────────────────────────────────────────
export const SliderRow: React.FC<{
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: string | ((v: number) => string);
  onChange: (v: number) => void;
  disabled?: boolean;
  realTime?: boolean;
  precisionButtons?: boolean;
}> = ({ label, description, value, min, max, step, display, onChange, disabled, realTime = true, precisionButtons = false }) => {
  const [localValue, setLocalValue] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (localValue === null) return;
    const timeout = setTimeout(() => setLocalValue(null), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const displayValue = localValue !== null ? localValue : value;
  const displayText = typeof display === 'function' ? display(displayValue) : display || displayValue.toString();

  return (
    <div className={`group flex flex-col gap-1.5 px-2.5 py-2 mb-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[var(--accent-primary)]/30 rounded-xl transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 mr-2 flex-1 min-w-0 pr-1">
          <span className="text-[11px] text-[var(--text-primary)] font-semibold leading-tight whitespace-normal break-words tracking-wide">{label}</span>
          {description && (
            <Tooltip content={description}>
              <HelpCircle size={10} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] cursor-help shrink-0 transition-colors" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {precisionButtons && (
            <button 
              onClick={() => { const val = Math.max(min, displayValue - step); setLocalValue(val); onChange(val); }}
              className="w-4 h-4 flex items-center justify-center bg-white/5 border border-white/10 rounded-md hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/40 text-[10px] font-bold transition-all"
            >
              -
            </button>
          )}
          <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold min-w-[32px] text-center bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 px-1 py-0.5 rounded-md">{displayText}</span>
          {precisionButtons && (
            <button 
              onClick={() => { const val = Math.min(max, displayValue + step); setLocalValue(val); onChange(val); }}
              className="w-4 h-4 flex items-center justify-center bg-white/5 border border-white/10 rounded-md hover:bg-[var(--accent-primary)]/20 hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/40 text-[10px] font-bold transition-all"
            >
              +
            </button>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={displayValue} 
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          setLocalValue(val);
          if (realTime) {
            onChange(val);
          }
        }}
        onPointerUp={() => { if (!realTime && localValue !== null) { onChange(localValue); } }}
        onBlur={() => { if (!realTime && localValue !== null) { onChange(localValue); } }}
        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)] mt-1 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent-primary)] [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
      />
    </div>
  );
};

// ── Select Row ─────────────────────────────────────────────────
export const SelectRow: React.FC<{
  label: string;
  description?: string;
  value: string;
  options: { label: string, value: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, description, value, options, onChange, disabled }) => (
  <div className={`group flex items-center justify-between px-2.5 py-2 mb-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[var(--accent-primary)]/30 rounded-xl transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
    <div className="flex items-center gap-1.5 mr-2 flex-1 min-w-0 pr-1">
      <span className="text-[11px] text-[var(--text-primary)] font-semibold leading-tight whitespace-normal break-words tracking-wide">{label}</span>
      {description && (
        <Tooltip content={description}>
          <HelpCircle size={10} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] cursor-help shrink-0 transition-colors" />
        </Tooltip>
      )}
    </div>
    <CustomSelect 
      value={value}
      options={options}
      onChange={onChange}
      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50 hover:bg-white/10 transition-all w-[100px] shrink-0"
    />
  </div>
);

// ── Hotkey Row ─────────────────────────────────────────────────
export const HotkeyRow: React.FC<{
  label: string;
  description?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, description, value, onChange, disabled }) => {
  const [isRecording, setIsRecording] = React.useState(false);

  React.useEffect(() => {
    if (!isRecording) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.key === 'Escape') {
        setIsRecording(false);
        return;
      }
      
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
        return;
      }
      
      const parts = [];
      if (e.ctrlKey) parts.push('Ctrl');
      if (e.shiftKey) parts.push('Shift');
      if (e.altKey) parts.push('Alt');
      if (e.metaKey) parts.push('Meta');
      
      let keyStr = e.code;
      if (keyStr.startsWith('Key')) keyStr = keyStr.replace('Key', '');
      else if (keyStr.startsWith('Digit')) keyStr = keyStr.replace('Digit', '');
      else if (e.key === ' ') keyStr = 'Space';
      
      parts.push(keyStr.toUpperCase());
      
      onChange(parts.join('+'));
      setIsRecording(false);
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isRecording, onChange]);

  return (
    <div className={`group flex items-center justify-between px-2.5 py-2 mb-1.5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-[var(--accent-primary)]/30 rounded-xl transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-1.5 mr-2 flex-1 min-w-0 pr-1">
        <span className="text-[11px] text-[var(--text-primary)] font-semibold leading-tight whitespace-normal break-words tracking-wide">{label}</span>
        {description && (
          <Tooltip content={description}>
            <HelpCircle size={10} className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] cursor-help shrink-0 transition-colors" />
          </Tooltip>
        )}
      </div>
      <button 
        onClick={() => setIsRecording(true)}
        className={`px-3 py-1 rounded-lg border text-[10px] font-bold tracking-wider transition-all uppercase shrink-0 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap ${
          isRecording 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' 
            : 'bg-white/5 text-[var(--accent-primary)] border-white/10 hover:border-[var(--accent-primary)]/50 hover:bg-white/10'
        }`}
      >
        {isRecording ? 'RECORDING...' : value}
      </button>
    </div>
  );
};

