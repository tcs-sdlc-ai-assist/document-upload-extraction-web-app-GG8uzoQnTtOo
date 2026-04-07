import { DocumentEntry, UploadProgress } from '@/types';
import { validate } from '@/services/FileValidator';
import { extract } from '@/services/Extractor';
import {
  saveDocument,
  listDocuments as repoListDocuments,
  getDocument as repoGetDocument,
  deleteDocument as repoDeleteDocument,
  getDocumentCount,
} from '@/repositories/LocalStorageRepository';
import { generateId } from '@/utils/generateId';
import { logError } from '@/utils/ErrorLogger';
import { MAX_DOCUMENTS_PER_USER } from '@/constants';

export async function uploadAndExtract(
  file: File,
  userId: string,
  onProgress: (progress: UploadProgress) => void,
): Promise<DocumentEntry> {
  // Phase 1: Validation
  onProgress({
    status: 'validating',
    progress: 10,
    message: 'Validating file...',
  });

  const validationResult = validate(file);
  if (!validationResult.valid) {
    const errorMessage = validationResult.error ?? 'File validation failed.';
    onProgress({
      status: 'error',
      progress: 0,
      message: errorMessage,
    });
    throw new Error(errorMessage);
  }

  // Check document limit
  const currentCount = getDocumentCount(userId);
  if (currentCount >= MAX_DOCUMENTS_PER_USER) {
    const errorMessage = `Document limit reached. You can store up to ${MAX_DOCUMENTS_PER_USER} documents. Please delete some documents before uploading new ones.`;
    onProgress({
      status: 'error',
      progress: 0,
      message: errorMessage,
    });
    throw new Error(errorMessage);
  }

  // Phase 2: Extraction
  onProgress({
    status: 'extracting',
    progress: 30,
    message: 'Extracting text from document...',
  });

  let extractedText: string;
  try {
    const extractionResult = await extract(file);
    if (!extractionResult.success) {
      const errorMessage = extractionResult.error ?? 'Text extraction failed.';
      onProgress({
        status: 'error',
        progress: 0,
        message: errorMessage,
      });
      throw new Error(errorMessage);
    }
    extractedText = extractionResult.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Text extraction failed.';
    logError('DocumentManager.uploadAndExtract', error instanceof Error ? error : new Error(String(error)), {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
    onProgress({
      status: 'error',
      progress: 0,
      message: errorMessage,
    });
    throw error;
  }

  onProgress({
    status: 'extracting',
    progress: 70,
    message: 'Text extracted successfully.',
  });

  // Phase 3: Saving
  onProgress({
    status: 'saving',
    progress: 85,
    message: 'Saving document...',
  });

  const documentEntry: DocumentEntry = {
    id: generateId(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    timestamp: Date.now(),
    extractedText,
    userId,
  };

  try {
    saveDocument(documentEntry);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to save document.';
    logError('DocumentManager.uploadAndExtract', error instanceof Error ? error : new Error(String(error)), {
      fileName: file.name,
      documentId: documentEntry.id,
    });
    onProgress({
      status: 'error',
      progress: 0,
      message: errorMessage,
    });
    throw new Error(errorMessage);
  }

  // Phase 4: Complete
  onProgress({
    status: 'complete',
    progress: 100,
    message: 'Document uploaded and processed successfully.',
  });

  return documentEntry;
}

export function listDocuments(userId: string): DocumentEntry[] {
  return repoListDocuments(userId);
}

export function getDocument(userId: string, docId: string): DocumentEntry | null {
  return repoGetDocument(userId, docId);
}

export function deleteDocument(userId: string, docId: string): void {
  repoDeleteDocument(userId, docId);
}