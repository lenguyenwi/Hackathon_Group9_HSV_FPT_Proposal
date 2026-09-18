/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  AlertOctagon,
} from 'lucide-react';
import { RequirementStatus } from '../types';

interface StatusBadgeProps {
  status: RequirementStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 space-x-1',
    md: 'text-xs px-2.5 py-1 space-x-1.5',
    lg: 'text-sm px-3 py-1.5 space-x-2 font-bold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  switch (status) {
    case 'COVERED':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 shrink-0`} />}
          <span className="tracking-wide">COVERED</span>
        </span>
      );

    case 'PARTIAL':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <AlertTriangle className={`${iconSizes[size]} text-amber-600 shrink-0`} />}
          <span className="tracking-wide">PARTIAL</span>
        </span>
      );

    case 'UNCLEAR':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-lg bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <HelpCircle className={`${iconSizes[size]} text-slate-500 shrink-0`} />}
          <span className="tracking-wide">UNCLEAR</span>
        </span>
      );

    case 'MISSING':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-lg bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs ${sizeClasses[size]} ${className}`}
        >
          {showIcon && <XCircle className={`${iconSizes[size]} text-rose-600 shrink-0`} />}
          <span className="tracking-wide">MISSING</span>
        </span>
      );

    case 'CONFLICT':
      return (
        <span
          className={`inline-flex items-center font-bold rounded-lg bg-rose-950 text-rose-100 border border-rose-800 shadow-xs ring-1 ring-rose-500/30 ${sizeClasses[size]} ${className}`}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
          {showIcon && <AlertOctagon className={`${iconSizes[size]} text-rose-300 shrink-0`} />}
          <span className="tracking-wide">CONFLICT</span>
        </span>
      );

    default:
      return null;
  }
};
