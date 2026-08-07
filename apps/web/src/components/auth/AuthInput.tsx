'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
  id: string;
};

const AuthInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className = '', ...rest }, ref) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground/80">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`w-full rounded-xl border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-fg
          outline-none transition-[border-color,box-shadow] duration-150
          ${error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-border focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
          } ${className}`}
        {...rest}
      />
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  ),
);

AuthInput.displayName = 'AuthInput';

export default AuthInput;
