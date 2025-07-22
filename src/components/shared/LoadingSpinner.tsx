import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-4',
        lg: 'w-12 h-12 border-[6px]',
    };
    return (
        <div className={cn('flex justify-center items-center', className)} {...props}>
            <div
                className={cn(
                    sizeClasses[size],
                    'animate-spin rounded-full border-solid border-primary border-t-transparent'
                )}
                role="status"
                aria-label="Loading"
            ></div>
        </div>
    );
}
