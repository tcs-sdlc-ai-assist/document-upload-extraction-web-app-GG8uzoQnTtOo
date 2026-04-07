import React, { useState, useCallback } from 'react';
import { useDocuments } from '@/contexts/DocumentContext';
import { DocumentEntry } from '@/types';
import StatusMessage from '@/components/StatusMessage';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeLabel(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'PDF';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'text/plain':
      return 'TXT';
    default:
      return fileType;
  }
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}

interface DocumentRowProps {
  document: DocumentEntry;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggleExpand: (docId: string) => void;
  onRequestDelete: (docId: string) => void;
  onConfirmDelete: (docId: string) => void;
  onCancelDelete: (docId: string) => void;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  document,
  isExpanded,
  isDeleting,
  onToggleExpand,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}) => {
  const typeLabel = getFileTypeLabel(document.fileType);

  return (
    <li
      className="bg-white border border-neutral-200 rounded-lg shadow-sm animate-fade-in"
      aria-label={`Document: ${document.fileName}`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-100 text-brand-700"
                aria-label={`File type: ${typeLabel}`}
              >
                {typeLabel}
              </span>
              <h3 className="text-sm font-semibold text-neutral-900 truncate" title={document.fileName}>
                {document.fileName}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
              <span aria-label={`File size: ${formatFileSize(document.fileSize)}`}>
                {formatFileSize(document.fileSize)}
              </span>
              <span aria-label={`Uploaded: ${formatTimestamp(document.timestamp)}`}>
                {formatTimestamp(document.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggleExpand(document.id)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 transition-colors duration-200"
              aria-expanded={isExpanded}
              aria-controls={`extracted-text-${document.id}`}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>

            {isDeleting ? (
              <div className="flex items-center gap-1.5" role="group" aria-label="Confirm deletion">
                <span className="text-xs text-danger-600 font-medium mr-1">Delete?</span>
                <button
                  type="button"
                  onClick={() => onConfirmDelete(document.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-danger-600 text-white hover:bg-danger-700 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-1 transition-colors duration-200"
                  aria-label={`Confirm delete ${document.fileName}`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => onCancelDelete(document.id)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 transition-colors duration-200"
                  aria-label="Cancel deletion"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onRequestDelete(document.id)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border border-danger-500 text-danger-600 bg-white hover:bg-danger-50 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-1 transition-colors duration-200"
                aria-label={`Delete ${document.fileName}`}
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {!isExpanded && document.extractedText && (
          <p className="mt-3 text-xs text-neutral-500 leading-relaxed">
            {truncateText(document.extractedText, 150)}
          </p>
        )}

        {isExpanded && (
          <div
            id={`extracted-text-${document.id}`}
            className="mt-4 animate-slide-up"
            role="region"
            aria-label={`Extracted text from ${document.fileName}`}
          >
            <h4 className="text-xs font-semibold text-neutral-700 mb-2">Extracted Text</h4>
            {document.extractedText ? (
              <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 max-h-64 overflow-y-auto scrollbar-thin">
                <pre className="text-xs text-neutral-800 whitespace-pre-wrap break-words font-sans leading-relaxed">
                  {document.extractedText}
                </pre>
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No extracted text available.</p>
            )}
          </div>
        )}
      </div>
    </li>
  );
};

export const HistoryComponent: React.FC = () => {
  const { documents, isLoading, error, deleteDocument, clearError } = useDocuments();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const handleToggleExpand = useCallback((docId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(docId)) {
        next.delete(docId);
      } else {
        next.add(docId);
      }
      return next;
    });
  }, []);

  const handleRequestDelete = useCallback((docId: string) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.add(docId);
      return next;
    });
  }, []);

  const handleConfirmDelete = useCallback(
    (docId: string) => {
      deleteDocument(docId);
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    },
    [deleteDocument],
  );

  const handleCancelDelete = useCallback((docId: string) => {
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(docId);
      return next;
    });
  }, []);

  const sortedDocuments = [...documents].sort((a, b) => b.timestamp - a.timestamp);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading documents">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-500">Loading documents…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-neutral-900">Document History</h2>
        <p className="mt-1 text-sm text-neutral-500">
          View and manage your uploaded documents and extracted text.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <StatusMessage type="error" message={error} onDismiss={clearError} />
        </div>
      )}

      {sortedDocuments.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-200 rounded-lg"
          role="status"
        >
          <div className="w-16 h-16 mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-neutral-700 mb-1">No documents yet</h3>
          <p className="text-sm text-neutral-500 text-center">
            Upload a document to see it appear here with its extracted text.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-neutral-500" aria-live="polite">
            {sortedDocuments.length} document{sortedDocuments.length !== 1 ? 's' : ''}
          </div>
          <ul className="space-y-3" aria-label="Document list">
            {sortedDocuments.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                isExpanded={expandedIds.has(doc.id)}
                isDeleting={deletingIds.has(doc.id)}
                onToggleExpand={handleToggleExpand}
                onRequestDelete={handleRequestDelete}
                onConfirmDelete={handleConfirmDelete}
                onCancelDelete={handleCancelDelete}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default HistoryComponent;