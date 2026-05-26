import type { ReactNode } from 'react';

export type Variants = 'primary' | 'secondary' | 'text' | 'outlined'
export type Size = 's' | 'm' | 'l'
export type FontWeight = 'light' | 'regular' | 'bold' | 'black'
export type Rounded = 's' | 'm' | 'l'
export type Option<T> = {
  label: ReactNode,
  value: T
}