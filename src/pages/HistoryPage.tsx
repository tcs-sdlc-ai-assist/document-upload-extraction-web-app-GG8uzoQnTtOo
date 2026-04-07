import React from 'react';
import HistoryComponent from '@/components/history/HistoryComponent';

const HistoryPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Document History</h1>
        <p className="mt-1 text-sm text-neutral-500">
          View and manage your previously uploaded documents and their extracted content.
        </p>
      </div>
      <HistoryComponent />
    </div>
  );
};

export default HistoryPage;