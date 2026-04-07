import React from 'react';
import { UploadProgress, UploadStatus } from '@/types';

interface ProgressIndicatorProps {
  uploadProgress: UploadProgress;
}

function getStatusConfig(status: UploadStatus): {
  barColor: string;
  bgColor: string;
  textColor: string;
  icon: string;
  label: string;
} {
  switch (status) {
    case 'idle':
      return {
        barColor: 'bg-neutral-300',
        bgColor: 'bg-neutral-100',
        textColor: 'text-neutral-500',
        icon: '⏳',
        label: 'Ready',
      };
    case 'validating':
      return {
        barColor: 'bg-brand-400',
        bgColor: 'bg-brand-50',
        textColor: 'text-brand-700',
        icon: '🔍',
        label: 'Validating',
      };
    case 'extracting':
      return {
        barColor: 'bg-brand-500',
        bgColor: 'bg-brand-50',
        textColor: 'text-brand-700',
        icon: '📄',
        label: 'Extracting',
      };
    case 'saving':
      return {
        barColor: 'bg-brand-600',
        bgColor: 'bg-brand-50',
        textColor: 'text-brand-700',
        icon: '💾',
        label: 'Saving',
      };
    case 'complete':
      return {
        barColor: 'bg-success-500',
        bgColor: 'bg-success-50',
        textColor: 'text-success-700',
        icon: '✅',
        label: 'Complete',
      };
    case 'error':
      return {
        barColor: 'bg-danger-500',
        bgColor: 'bg-danger-50',
        textColor: 'text-danger-700',
        icon: '❌',
        label: 'Error',
      };
  }
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ uploadProgress }) => {
  const { status, progress, message } = uploadProgress;
  const config = getStatusConfig(status);

  if (status === 'idle') {
    return null;
  }

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className={`w-full rounded-lg p-4 ${config.bgColor} animate-fade-in`}
      data-testid="progress-indicator"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {config.icon}
          </span>
          <span className={`text-sm font-semibold ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-sm font-medium ${config.textColor}`}>
          {clampedProgress}%
        </span>
      </div>

      <div
        className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Upload progress: ${config.label} - ${clampedProgress}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${config.barColor}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>

      {message && (
        <p
          className={`mt-2 text-sm ${config.textColor}`}
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ProgressIndicator;