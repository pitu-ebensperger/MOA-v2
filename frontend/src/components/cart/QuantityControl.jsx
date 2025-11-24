import PropTypes from 'prop-types';
import { Minus, Plus } from "lucide-react";
import { buttonClasses } from '@/components/shadcn/ui/index.js';

// Reusable quantity control for cart items
export function QuantityControl({ value, onChange, min = 1, max, disabled = false, className = '' }) {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && (typeof max !== 'number' || value < max);

  const handle = (delta) => {
    if (disabled) return;
    const next = value + delta;
    if (next < min) return;
    if (typeof max === 'number' && next > max) return;
    onChange?.(next);
  };

  return (
    <div className={`flex items-center gap-1 rounded-full border border-(--border) bg-white/60 px-1.5 py-0.5 ${className}`}>      
      <button
        type="button"
        onClick={() => handle(-1)}
        disabled={!canDecrement}
        className={buttonClasses({
          variant: 'ghost',
          size: 'icon',
          className: `h-8 w-8 text-(--color-primary2) ${!canDecrement ? 'opacity-40 cursor-not-allowed' : ''}`,
        })}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-7 text-center font-semibold select-none" aria-live="polite">{value}</span>
      <button
        type="button"
        onClick={() => handle(1)}
        disabled={!canIncrement}
        className={buttonClasses({
          variant: 'ghost',
          size: 'icon',
          className: `h-8 w-8 text-(--color-primary2) ${!canIncrement ? 'opacity-40 cursor-not-allowed' : ''}`,
        })}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

QuantityControl.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
