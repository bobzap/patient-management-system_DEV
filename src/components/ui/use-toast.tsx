// src/components/ui/use-toast.tsx
'use client';
 
import * as React from 'react';
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function toast({ title, description, variant = 'default' }: ToastProps) {
  const toastFn = variant === 'destructive' ? sonnerToast.error : sonnerToast;
  toastFn(title, {
    description,
  });
}