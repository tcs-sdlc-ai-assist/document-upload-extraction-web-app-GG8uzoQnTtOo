import React from 'react';

export type StatusMessageType = 'success' | 'error' | 'warning' | 'info';

export interface StatusMessageProps {
  type: StatusMessageType;
  message: string;
  onDismiss?: () => void;
}

const typeStyles: Record<StatusMessageType, { container: string; icon: string; iconPath: string }> = {
  success: {
    container: 'bg-success-50 border-success-500 text-success-700',
    icon: 'text-success-500',
    iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    container: 'bg-danger-50 border-danger-500 text-danger-700',
    icon: 'text-danger-500',
    iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    container: 'bg-warning-50 border-warning-500 text-warning-700',
    icon: 'text-warning-500',
    iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    container: 'bg-brand-50 border-brand-500 text-brand-700',
    icon: 'text-brand-500',
    iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

export const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, onDismiss }) => {
  const styles = typeStyles[type];
  const isError = type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`flex items-start gap-3 rounded-lg border-l-4 p-4 animate-fade-in ${styles.container}`}
    >
      <svg
        className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={styles.iconPath} />
      </svg>
      <p className="flex-1 text-sm font-medium">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 rounded-md p-1 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 transition-opacity duration-200"
          aria-label="Dismiss message"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default StatusMessage;