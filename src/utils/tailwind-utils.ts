import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function tailwind(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
