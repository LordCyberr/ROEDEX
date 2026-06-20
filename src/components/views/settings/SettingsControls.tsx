import React from 'react';
import { CustomSelect } from '../../ui/CustomSelect';

// ── Toggle Row ─────────────────────────────────────────────────
export const ToggleRow: React.FC<{ label: string; description?: string; value: boolean; onChange: (v: boolean) => void; disabled?: boolean }> = ({ label, description, value, onChange, disabled }) => (
  <div className={`flex items-center justify-between px-2 py-2 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex flex-col mr-2 flex-1 min-w-0 pr-2">
      <span className="text-[11px] text-[var(--text-primary)] font-medium leading-tight whitespace-normal break-words">{label}</span>
      {description && <span className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight whitespace-normal break-words">{description}</span>}
    </div>
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-7 h-4 bg-[var(--bg-card)] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent-primary)] shadow-inner"></div>
    </label>
  </div>
);

// ── Slider Row ─────────────────────────────────────────────────
export const SliderRow: React.FC<{ label: string; description?: string; value: number; min: number; max: number; step: number; display?: string | ((v: number) => string); onChange: (v: number) => void; disabled?: boolean; realTime?: boolean }> = ({ label, description, value, min, max, step, display, onChange, disabled, realTime = true }) => {
  const [localValue, setLocalValue] = React.useState<number | null>(null);

  // Sync local state if external value changes (and we aren't dragging)
  React.useEffect(() => {
    if (localValue === null) return;
    const timeout = setTimeout(() => setLocalValue(null), 100);
    return () => clearTimeout(timeout);
  }, [value]);

  const displayValue = localValue !== null ? localValue : value;
  const displayText = typeof display === 'function' ? display(displayValue) : display || displayValue.toString();

  return (
    <div className={`flex flex-col gap-1.5 px-2 py-2 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col mr-2 flex-1 min-w-0 pr-2">
          <span className="text-[11px] text-[var(--text-primary)] font-medium leading-tight whitespace-normal break-words">{label}</span>
          {description && <span className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight whitespace-normal break-words">{description}</span>}
        </div>
        <span className="text-[10px] font-mono text-[var(--accent-primary)] font-bold shrink-0">{displayText}</span>
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
        className="w-full h-1.5 bg-[var(--bg-card)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)] mt-1"
      />
    </div>
  );
};

// ── Select Row ─────────────────────────────────────────────────
export const SelectRow: React.FC<{ label: string; description?: string; value: string; options: { label: string, value: string }[]; onChange: (v: string) => void; disabled?: boolean }> = ({ label, description, value, options, onChange, disabled }) => (
  <div className={`flex items-center justify-between px-2 py-2 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    <div className="flex flex-col mr-2 flex-1 min-w-0 pr-2">
      <span className="text-[11px] text-[var(--text-primary)] font-medium leading-tight whitespace-normal break-words">{label}</span>
      {description && <span className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight whitespace-normal break-words">{description}</span>}
    </div>
    <CustomSelect 
      value={value}
      options={options}
      onChange={onChange}
      className="bg-[var(--bg-card)] border border-[var(--border-accent)] rounded px-2 py-1 text-[10px] text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-all w-[90px] shrink-0"
    />
  </div>
);

// ── Hotkey Row ─────────────────────────────────────────────────
export const HotkeyRow: React.FC<{ label: string; description?: string; value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ label, description, value, onChange, disabled }) => {
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
      
      // Ignore bare modifiers
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
    <div className={`flex items-center justify-between px-2 py-2 mb-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-lg ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className="flex flex-col mr-2 flex-1 min-w-0 pr-2">
        <span className="text-[11px] text-[var(--text-primary)] font-medium leading-tight whitespace-normal break-words">{label}</span>
        {description && <span className="text-[9px] text-[var(--text-muted)] mt-1 leading-tight whitespace-normal break-words">{description}</span>}
      </div>
      <button 
        onClick={() => setIsRecording(true)}
        className={`px-3 py-1 rounded border text-[10px] font-bold tracking-wider transition-colors uppercase shrink-0 max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap ${
          isRecording 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500 animate-pulse' 
            : 'bg-[var(--bg-card)] text-[var(--accent-primary)] border-[var(--border-accent)] hover:border-[var(--accent-primary)]'
        }`}
      >
        {isRecording ? 'PRESS ANY KEY...' : value}
      </button>
    </div>
  );
};
