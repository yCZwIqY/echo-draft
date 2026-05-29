import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { tv } from 'tailwind-variants/lite';

type RangeHandle = 'start' | 'end';
type RangeValue = [number, number];

interface DnRangeSliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  maxValue?: number;
  minValue?: number;
  step?: number;
  disabled?: boolean;
}

const styles = tv({
  slots: {
    container: ['w-full h-5 relative flex items-center touch-none select-none'],
    background: ['bg-stone-100 w-full h-2 rounded-full overflow-hidden'],
    value: ['absolute h-2 rounded-full bg-primary-500'],
    handle: [
      'dn-range-slider-handle size-4 rounded-full bg-primary-500 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-sm outline-none',
      'focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
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

const getPercent = (value: number, minValue: number, maxValue: number) => {
  const range = maxValue - minValue;

  if (range === 0) {
    return 0;
  }

  return ((value - minValue) / range) * 100;
};

const getSafeRange = (
  value: RangeValue,
  minValue: number,
  maxValue: number,
  step: number,
): RangeValue => {
  const start = getSteppedValue(value[0], minValue, maxValue, step);
  const end = getSteppedValue(value[1], minValue, maxValue, step);

  return start <= end ? [start, end] : [end, start];
};

const DnRangeSlider = ({
  value,
  minValue = 0,
  maxValue = 100,
  step = 1,
  disabled = false,
  className,
  onChange,
  ...rest
}: DnRangeSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeHandleRef = useRef<RangeHandle>('start');
  const safeStep = step > 0 ? step : 1;
  const safeMinValue = Math.min(minValue, maxValue);
  const safeMaxValue = Math.max(minValue, maxValue);
  const [startValue, endValue] = useMemo(
    () => getSafeRange(value, safeMinValue, safeMaxValue, safeStep),
    [safeMaxValue, safeMinValue, safeStep, value],
  );
  const startPercent = getPercent(startValue, safeMinValue, safeMaxValue);
  const endPercent = getPercent(endValue, safeMinValue, safeMaxValue);
  const rangeStyles = styles({ disabled });

  useEffect(() => {
    if (startValue !== value[0] || endValue !== value[1]) {
      onChange([startValue, endValue]);
    }
  }, [endValue, onChange, startValue, value]);

  const getValueByClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current;

      if (!container) {
        return safeMinValue;
      }

      const rect = container.getBoundingClientRect();
      const percent = rect.width === 0 ? 0 : (clientX - rect.left) / rect.width;

      return getSteppedValue(
        safeMinValue + percent * (safeMaxValue - safeMinValue),
        safeMinValue,
        safeMaxValue,
        safeStep,
      );
    },
    [safeMaxValue, safeMinValue, safeStep],
  );

  const updateValue = useCallback(
    (handle: RangeHandle, nextValue: number) => {
      if (disabled) {
        return;
      }

      if (handle === 'start') {
        onChange([Math.min(nextValue, endValue), endValue]);
        return;
      }

      onChange([startValue, Math.max(nextValue, startValue)]);
    },
    [disabled, endValue, onChange, startValue],
  );

  const getClosestHandle = (nextValue: number): RangeHandle => {
    const startDistance = Math.abs(nextValue - startValue);
    const endDistance = Math.abs(nextValue - endValue);

    return startDistance <= endDistance ? 'start' : 'end';
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const nextValue = getValueByClientX(e.clientX);
    const nextHandle = getClosestHandle(nextValue);

    activeHandleRef.current = nextHandle;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateValue(nextHandle, nextValue);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
      return;
    }

    updateValue(activeHandleRef.current, getValueByClientX(e.clientX));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onHandleKeyDown = (handle: RangeHandle) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    const currentValue = handle === 'start' ? startValue : endValue;
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
      updateValue(handle, safeMinValue);
      return;
    }

    if (next === 'max') {
      updateValue(handle, safeMaxValue);
      return;
    }

    updateValue(
      handle,
      getSteppedValue(currentValue + next, safeMinValue, safeMaxValue, safeStep),
    );
  };

  return (
    <div
      {...rest}
      ref={containerRef}
      className={[rangeStyles.container(), className].filter(Boolean).join(' ')}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={rangeStyles.background()} />
      <div
        className={rangeStyles.value()}
        style={{
          left: `${startPercent}%`,
          width: `${endPercent - startPercent}%`,
        }}
      />
      <div
        role='slider'
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label='Minimum value'
        aria-valuemin={safeMinValue}
        aria-valuemax={endValue}
        aria-valuenow={startValue}
        className={rangeStyles.handle()}
        style={{ left: `${startPercent}%` }}
        onKeyDown={onHandleKeyDown('start')}
      />
      <div
        role='slider'
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-label='Maximum value'
        aria-valuemin={startValue}
        aria-valuemax={safeMaxValue}
        aria-valuenow={endValue}
        className={rangeStyles.handle()}
        style={{ left: `${endPercent}%` }}
        onKeyDown={onHandleKeyDown('end')}
      />
    </div>
  );
};

export default DnRangeSlider;
