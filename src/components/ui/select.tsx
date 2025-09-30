import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef } from 'react';

interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = ({ 
  className, 
  label,
  error,
  options,
  ...props 
}: SelectProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-blue-800 mb-1">
          {label}
        </label>
      )}
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { Select };