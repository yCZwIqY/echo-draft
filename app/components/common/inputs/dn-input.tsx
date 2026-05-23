import type { FontWeight, Rounded, Size } from '~/components';
import { tv } from 'tailwind-variants/lite';
import { TextInput, type TextInputProps } from 'jy-headless';

interface Props extends Omit<TextInputProps, 'size'> {
  variant?: 'outlined' | 'underlined' | 'text';
  size?: Size;
  fontWeight?: FontWeight;
  rounded?: Rounded;
}

const styles = tv({
  base: [
    'outline-2 outline-transparent outline-offset-1 transition-all px-2 py-1',
    '[&_input]:outline-none [&_input]:w-full [&_input]:h-full',
  ],
  variants: {
    variant: {
      outlined: 'bg-none border border-gray-500 text-gray-900 focus-within:outline-primary-500',
      underlined:
        'bg-none border-b border-gray-800 text-gray-900 rounded-none! outline-0 focus-within:border-primary-500 ',
      text: 'bg-none focus-within:outline-primary-500',
    },
    size: {
      s: 'min-w-4 h-8 typo-b6-b',
      m: 'min-w-6 h-11 typo-b3-b',
      l: 'min-w-8 h-13 typo-b2-b',
    },
    rounded: {
      s: 'rounded-sm',
      m: 'rounded-md',
      l: 'rounded-l',
    },
    fontWeight: {
      light: 'font-light!',
      regular: 'font-regular!',
      bold: 'font-bold!',
      black: 'font-black!',
    },
  },
});

const DnInput = ({
  variant = 'outlined',
  size = 'm',
  fontWeight = 'regular',
  rounded = 'm',
  className,
  ...rest
}: Props) => {
  return (
    <div
      className={[styles({ variant, size, fontWeight, rounded }), className].join(' ')}
      {...rest}
    >
      <TextInput
        {...rest}
        className={className}
      />
    </div>
  );
};

export default DnInput;
