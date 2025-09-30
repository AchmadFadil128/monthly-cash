import { cn } from '@/lib/utils';
import { ComponentPropsWithoutRef, useState, useEffect } from 'react';
import { formatCurrency, parseCurrency } from '@/lib/currency';

interface CurrencyInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  onValueChange?: (value: number) => void; // Callback for the numeric value
}

const CurrencyInput = ({ 
  className, 
  label,
  error,
  value,
  onValueChange,
  onChange,
  ...props 
}: CurrencyInputProps) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  
  // Update display value when the external value changes
  useEffect(() => {
    let numericValue: number;
    
    if (typeof value === 'number') {
      numericValue = value;
    } else if (typeof value === 'string') {
      // If value is a string (like from form state), parse it
      numericValue = parseCurrency(value);
    } else {
      // Fallback to 0 if value is undefined/null
      numericValue = 0;
    }
    
    setDisplayValue(formatCurrency(numericValue));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Parse the numeric value from the formatted input
    const numericValue = parseCurrency(rawValue);
    
    // Update the display value to ensure it's properly formatted
    setDisplayValue(formatCurrency(numericValue));
    
    // Call the parent onChange handler if provided
    if (onChange) {
      // Create a new event with the numeric value as a string
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: numericValue.toString(), // Pass the numeric value as string
          name: e.target.name
        }
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
    
    // Call the value change callback
    if (onValueChange) {
      onValueChange(numericValue);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-blue-800 mb-1">
          {label}
        </label>
      )}
      <input
        type="text"
        className={cn(
          "flex h-10 w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        value={displayValue}
        onChange={handleChange}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export { CurrencyInput };