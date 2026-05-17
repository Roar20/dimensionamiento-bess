import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-input border border-field-border bg-white px-3 py-2 text-sm text-ink-primary shadow-sm transition-colors placeholder:text-ink-helper focus-visible:border-field-focus focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-field-focus/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
