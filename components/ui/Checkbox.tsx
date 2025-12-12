'use client';

import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        'w-4 h-4 border rounded flex items-center justify-center transition-colors',
        checked || indeterminate
          ? 'bg-primary-600 border-primary-600'
          : 'bg-white border-gray-300 hover:border-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
      {indeterminate && !checked && <Minus size={12} className="text-white" strokeWidth={3} />}
    </button>
  );
}
