import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DocumentEntry, UploadProgress } from '@/types';
import { useSession } from '@/contexts/SessionContext';
import * as DocumentManager from '@/services/DocumentManager';
import * as LocalStorageRepository from '@/repositories/LocalStorageRepository';
import { logError } from '@/utils/ErrorLogger';

interface DocumentContextValue {
  documents: DocumentEntry[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: UploadProgress;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (docId: string) => void;
  refreshDocuments: () => void;
  clearError: () => void;
}

const initialUploadProgress: UploadProgress = {
  status: 'idle',
  progress: 0,
  message: '',
};

const DocumentContext = createContext<DocumentContextValue | null>(null);

export function useDocuments(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}

interface DocumentProviderProps {
  children: React.ReactNode;
}

export function DocumentProvider({ children }: DocumentProviderProps) {
  const { session } = useSession();
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>(initialUploadProgress);

  const userId = session?.username ?? null;

  const refreshDocuments = useCallback(() => {
    if (!userId) {
      setDocuments([]);
      return;
    }
    try {
      const docs = LocalStorageRepository.listDocuments(userId);
      setDocuments(docs);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logError('DocumentContext.refreshDocuments', message);
      setError('Failed to load documents.');
    }
  }, [userId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const uploadDocument = useCallback(async (file: File) => {
    if (!userId) {
      setError('You must be logged in to upload documents.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setUploadProgress({ status: 'validating', progress: 10, message: 'Validating file...' });

    try {
      setUploadProgress({ status: 'extracting', progress: 40, message: 'Extracting text...' });

      const doc = await DocumentManager.processDocument(file, userId);

      setUploadProgress({ status: 'saving', progress: 80, message: 'Saving document...' });

      if (!doc.success) {
        setUploadProgress({ status: 'error', progress: 0, message: doc.error ?? 'Upload failed.' });
        setError(doc.error ?? 'Upload failed.');
        setIsLoading(false);
        return;
      }

      setUploadProgress({ status: 'complete', progress: 100, message: 'Upload complete!' });
      refreshDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logError('DocumentContext.uploadDocument', message);
      setUploadProgress({ status: 'error', progress: 0, message });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshDocuments]);

  const deleteDoc = useCallback((docId: string) => {
    if (!userId) {
      setError('You must be logged in to delete documents.');
      return;
    }

    try {
      LocalStorageRepository.deleteDocument(userId, docId);
      refreshDocuments();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logError('DocumentContext.deleteDocument', message);
      setError('Failed to delete document.');
    }
  }, [userId, refreshDocuments]);

  const clearError = useCallback(() => {
    setError(null);
    if (uploadProgress.status === 'error') {
      setUploadProgress(initialUploadProgress);
    }
  }, [uploadProgress.status]);

  const value = useMemo<DocumentContextValue>(() => ({
    documents,
    isLoading,
    error,
    uploadProgress,
    uploadDocument,
    deleteDocument: deleteDoc,
    refreshDocuments,
    clearError,
  }), [documents, isLoading, error, uploadProgress, uploadDocument, deleteDoc, refreshDocuments, clearError]);

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}