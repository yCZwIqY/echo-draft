import type { ButtonHTMLAttributes } from 'react';
import { tv } from 'tailwind-variants/lite';

type Variant = 'default' | 'dark' | 'ghost';
type Size = 's' | 'm' | 'l';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const styles = tv({
  base: 'flex items-center justify-center rounded-2xl transition-all',
  variants: {
    variant: {
      default:
        'border border-stone-200 bg-white/85 text-stone-600 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-primary-200 hover:text-primary-600',
      dark:
        'bg-stone-900 text-white shadow-sm hover:-translate-y-0.5 hover:bg-primary-600',
      ghost:
        'text-stone-400 hover:bg-stone-200 hover:text-stone-700 active:bg-stone-300',
    },
    size: {
      s: 'h-8 w-8',
      m: 'h-10 w-10',
      l: 'h-11 w-11',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'm',
  },
});

const DnIconButton = ({ variant, size, className, type = 'button', ...rest }: Props) => {
  return (
    <button
      {...rest}
      className={[styles({ variant, size }), className].filter(Boolean).join(' ')}
      type={type}
    />
  );
};

export default DnIconButton;
