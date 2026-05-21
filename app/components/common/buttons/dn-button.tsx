import type { ButtonHTMLAttributes } from 'react';
import type { FontWeight, Rounded, Size, Variants } from '~/components';
import { tv } from 'tailwind-variants/lite';

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: Variants;
  size?: Size;
  fontWeight?: FontWeight;
  rounded?: Rounded;
}

const styles = tv({
  base: 'outline-2 outline-transparent outline-offset-1 transition-all focus:outline-primary-500',
  variants: {
    variant: {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 ',
      secondary: 'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700',
      outlined: 'bg-none border border-gray-500 text-gray-800 hover:bg-gray-500/10 active:bg-gray-500/20',
      text: 'hover:bg-gray-300/50 active:bg-gray-400/50',
    },
    size: {
      s: 'h-8 typo-b6-b px-2 py-1',
      m: 'h-11 typo-b3-b px-4 py-2',
      l: 'h-13 typo-b2-b px-5 py-2',
    },
    rounded: {
      s: 'rounded-sm!',
      m: 'rounded-md!',
      l: 'rounded-l!',
    },
    fontWeight: {
      light: 'font-light!',
      regular: 'font-regular!',
      bold: 'font-bold!',
      black: 'font-black!',
    },
  },
});

const DnButton = ({
  variant = 'primary',
  size = 'm',
  fontWeight = 'bold',
  rounded = 'm',
  className,
  ...rest
}: Props) => {
  return (
    <button
      {...rest}
      className={`${styles({ variant, size, fontWeight, rounded })} ${className}`}
    />
  );
};

export default DnButton;
