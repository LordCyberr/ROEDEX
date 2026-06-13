import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CustomSelectProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ 
  value, 
  options, 
  onChange, 
  className = '', 
  dropdownClassName = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className={`relative flex-shrink-0 ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`} ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 cursor-pointer w-full h-full`}
      >
        <span className="truncate flex-1 min-w-0 text-left leading-tight">{selectedLabel}</span>
        <ChevronDown size={10} className={`transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className={`absolute top-full right-0 mt-1 w-max min-w-full bg-[var(--bg-panel)] border border-[var(--border-accent)] rounded-md shadow-xl z-[100] overflow-hidden flex flex-col ${dropdownClassName}`}>
          {options.map((opt) => (
            <div 
              key={opt.value} 
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-2 py-1.5 text-[10px] cursor-pointer hover:bg-[var(--accent-primary)] hover:text-white transition-colors whitespace-nowrap ${value === opt.value ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] font-bold' : 'text-[var(--text-primary)] font-medium'}`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
