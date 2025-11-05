import { ReactNode } from 'react';
import { VerdictLevel } from '../../types';

interface BadgeProps {
  children: ReactNode;
  variant?: VerdictLevel | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    'true': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'likely-true': 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-500',
    'uncertain': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'likely-false': 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-500',
    'false': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'default': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>{children}</span>;
}
