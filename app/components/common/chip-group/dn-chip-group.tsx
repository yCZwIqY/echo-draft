import type { HTMLAttributes } from 'react';
import type { Option } from '~/components';
import { tv } from 'tailwind-variants/lite';

interface DnChipGroupProps<T> extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

const styles = tv({
  slots: {
    container: ['grid gap-2'],
    chip: [
      'h-9 rounded-md border border-stone-200 bg-white px-3 typo-b5-b text-stone-600 transition-all',
      'hover:border-primary-300 hover:bg-primary-100/30 hover:text-primary-600',
      'focus-visible:outline-2 focus-visible:outline-primary-500 focus-visible:outline-offset-2',
    ],
  },
  variants: {
    selected: {
      true: {
        chip: 'border-primary-500 bg-primary-500! text-white hover:bg-primary-600 hover:text-white',
      },
    },
    disabled: {
      true: {
        container: 'opacity-50',
        chip: 'cursor-not-allowed hover:border-stone-200 hover:bg-white hover:text-stone-600',
      },
    },
  },
});

const DnChipGroup = <T,>({
  options,
  value,
  onChange,
  disabled = false,
  className,
  ...rest
}: DnChipGroupProps<T>) => {
  const columnCount = Math.max(options.length, 1);

  return (
    <div
      {...rest}
      className={[styles({ disabled }).container(), className].filter(Boolean).join(' ')}
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
        ...rest.style,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={String(option.value)}
            type='button'
            disabled={disabled}
            aria-pressed={selected}
            className={styles({ selected, disabled }).chip()}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default DnChipGroup;
