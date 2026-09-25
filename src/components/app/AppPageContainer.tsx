import type { HTMLAttributes } from 'react';
import { cn } from 'cn';

export function AppPageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1630px] px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:py-8 lg:px-8',
        className,
      )}
      {...props}
    />
  );
}
