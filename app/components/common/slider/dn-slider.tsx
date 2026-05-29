import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { tv } from 'tailwind-variants/lite';

interface DnSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  maxValue?: number;
  minValue?: number;
  step?: number;
  disabled?: boolean;
}

const style = tv({
  slots: {
    container: [
      'w-full h-5 relative flex items-center outline-none touch-none select-none',
      'focus-visible:[&_.dn-slider-handle]:outline-2 focus-visible:[&_.dn-slider-handle]:outline-primary-500 focus-visible:[&_.dn-slider-handle]:outline-offset-2',
    ],
    background: ['bg-stone-100 w-full h-2 rounded-full overflow-hidden'],
    value: ['h-full rounded-full bg-primary-500'],
    handle: [
      'dn-slider-handle size-4 rounded-full bg-primary-500 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-sm',
    ],
  },
  variants: {
    disabled: {
      true: {
        container: 'opacity-50 cursor-not-allowed',
        handle: 'cursor-not-allowed',
      },
    },
  },
});

const getSteppedValue = (value: number, minValue: number, maxValue: number, step: number) => {
  const clampedValue = Math.max(minValue, Math.min(value, maxValue));
  const steppedValue = Math.round((clampedValue - minValue) / step) * step + minValue;
  const precision = String(step).split('.')[1]?.length ?? 0;

  return Number(Math.max(minValue, Math.min(steppedValue, maxValue)).toFixed(precision));
};

const DnSlider = ({
  value,
  minValue = 0,
  maxValue = 100,
  step = 1,
  disabled = false,
  className,
  onChange,
  ...rest
}: DnSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const safeStep = step > 0 ? step : 1;
  const safeMaxValue = Math.max(minValue, maxValue);
  const safeMinValue = Math.min(minValue, maxValue);
  const currentValue = getSteppedValue(value, safeMinValue, safeMaxValue, safeStep);
  const percent = useMemo(() => {
    const range = safeMaxValue - safeMinValue;

    if (range === 0) {
      return 0;
    }

    return ((currentValue - safeMinValue) / range) * 100;
  }, [currentValue, safeMaxValue, safeMinValue]);
  const styles = style({ disabled });

  useEffect(() => {
    if (currentValue !== value) {
      onChange(currentValue);
    }
  }, [currentValue, onChange, value]);

  const updateValueByClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current;

      if (!container || disabled) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const nextPercent = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;
      const nextValue = safeMinValue + nextPercent * (safeMaxValue - safeMinValue);

      onChange(getSteppedValue(nextValue, safeMinValue, safeMaxValue, safeStep));
    },
    [disabled, onChange, safeMaxValue, safeMinValue, safeStep],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    updateValueByClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }

    updateValueByClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const keyMap: Record<string, number | 'min' | 'max'> = {
      ArrowLeft: -safeStep,
      ArrowDown: -safeStep,
      ArrowRight: safeStep,
      ArrowUp: safeStep,
      Home: 'min',
      End: 'max',
    };
    const next = keyMap[e.key];

    if (next === undefined) {
      return;
    }

    e.preventDefault();

    if (next === 'min') {
      onChange(safeMinValue);
      return;
    }

    if (next === 'max') {
      onChange(safeMaxValue);
      return;
    }

    onChange(getSteppedValue(currentValue + next, safeMinValue, safeMaxValue, safeStep));
  };

  return (
    <div
      {...rest}
      ref={containerRef}
      role='slider'
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-valuemin={safeMinValue}
      aria-valuemax={safeMaxValue}
      aria-valuenow={currentValue}
      className={[styles.container(), className].filter(Boolean).join(' ')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div className={styles.background()}>
        <div
          className={styles.value()}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        className={styles.handle()}
        style={{
          left: `${percent}%`,
        }}
      />
    </div>
  );
};

export default DnSlider;
