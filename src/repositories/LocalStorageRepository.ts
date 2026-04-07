import { DocumentEntry } from '@/types';
import { STORAGE_KEYS, MAX_DOCUMENTS_PER_USER } from '@/constants';
import { logError } from '@/utils/ErrorLogger';

function getStorageKey(userId: string): string {
  return `${STORAGE_KEYS.documents}_${userId}`;
}

function readDocuments(userId: string): DocumentEntry[] {
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed as DocumentEntry[];
  } catch (error) {
    logError({
      code: 'STORAGE_READ_ERROR',
      message: error instanceof Error ? error.message : 'Failed to read documents from localStorage',
      timestamp: Date.now(),
      context: 'LocalStorageRepository.readDocuments',
    });
    return [];
  }
}

function writeDocuments(userId: string, documents: DocumentEntry[]): void {
  try {
    const key = getStorageKey(userId);
    const serialized = JSON.stringify(documents);
    localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logError({
        code: 'STORAGE_QUOTA_EXCEEDED',
        message: 'localStorage quota exceeded. Unable to save documents.',
        timestamp: Date.now(),
        context: 'LocalStorageRepository.writeDocuments',
      });
      throw new Error('Storage quota exceeded. Please delete some documents and try again.');
    }
    logError({
      code: 'STORAGE_WRITE_ERROR',
      message: error instanceof Error ? error.message : 'Failed to write documents to localStorage',
      timestamp: Date.now(),
      context: 'LocalStorageRepository.writeDocuments',
    });
    throw new Error('Failed to save document. Please try again.');
  }
}

export function saveDocument(doc: DocumentEntry): void {
  const documents = readDocuments(doc.userId);

  if (documents.length >= MAX_DOCUMENTS_PER_USER) {
    throw new Error(
      `Maximum document limit (${MAX_DOCUMENTS_PER_USER}) reached. Please delete some documents before uploading new ones.`
    );
  }

  const existingIndex = documents.findIndex((d) => d.id === doc.id);
  if (existingIndex >= 0) {
    documents[existingIndex] = doc;
  } else {
    documents.push(doc);
  }

  writeDocuments(doc.userId, documents);
}

export function listDocuments(userId: string): DocumentEntry[] {
  const documents = readDocuments(userId);
  return documents.sort((a, b) => b.timestamp - a.timestamp);
}

export function getDocument(userId: string, docId: string): DocumentEntry | null {
  const documents = readDocuments(userId);
  const doc = documents.find((d) => d.id === docId);
  return doc ?? null;
}

export function deleteDocument(userId: string, docId: string): void {
  const documents = readDocuments(userId);
  const filtered = documents.filter((d) => d.id !== docId);

  if (filtered.length === documents.length) {
    return;
  }

  writeDocuments(userId, filtered);
}

export function getDocumentCount(userId: string): number {
  const documents = readDocuments(userId);
  return documents.length;
}