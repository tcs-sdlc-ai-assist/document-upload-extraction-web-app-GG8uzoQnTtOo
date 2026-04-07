import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentEntry, UploadProgress } from '@/types';

vi.mock('@/services/FileValidator', () => ({
  validate: vi.fn(),
}));

vi.mock('@/services/Extractor', () => ({
  extract: vi.fn(),
}));

vi.mock('@/repositories/LocalStorageRepository', () => ({
  saveDocument: vi.fn(),
  listDocuments: vi.fn(),
  getDocument: vi.fn(),
  deleteDocument: vi.fn(),
  getDocumentCount: vi.fn(),
}));

vi.mock('@/utils/generateId', () => ({
  generateId: vi.fn(() => 'test-id-123'),
}));

vi.mock('@/utils/ErrorLogger', () => ({
  logError: vi.fn(),
}));

import * as DocumentManager from '@/services/DocumentManager';
import { validate } from '@/services/FileValidator';
import { extract } from '@/services/Extractor';
import * as LocalStorageRepository from '@/repositories/LocalStorageRepository';

const mockedValidate = vi.mocked(validate);
const mockedExtract = vi.mocked(extract);
const mockedSaveDocument = vi.mocked(LocalStorageRepository.saveDocument);
const mockedListDocuments = vi.mocked(LocalStorageRepository.listDocuments);
const mockedGetDocument = vi.mocked(LocalStorageRepository.getDocument);
const mockedDeleteDocument = vi.mocked(LocalStorageRepository.deleteDocument);
const mockedGetDocumentCount = vi.mocked(LocalStorageRepository.getDocumentCount);

function createMockFile(name = 'test.pdf', size = 1024, type = 'application/pdf'): File {
  const content = new ArrayBuffer(size);
  return new File([content], name, { type });
}

describe('DocumentManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadAndExtract', () => {
    it('should complete full upload workflow successfully', async () => {
      const file = createMockFile('report.pdf', 2048, 'application/pdf');
      const userId = 'user-1';
      const onProgress = vi.fn();

      mockedValidate.mockReturnValue({ valid: true });
      mockedGetDocumentCount.mockReturnValue(0);
      mockedExtract.mockResolvedValue({
        success: true,
        text: 'Extracted text content',
      });

      const result = await DocumentManager.uploadAndExtract(file, userId, onProgress);

      expect(mockedValidate).toHaveBeenCalledWith(file);
      expect(mockedExtract).toHaveBeenCalledWith(file);
      expect(mockedSaveDocument).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.fileName).toBe('report.pdf');
      expect(result.extractedText).toBe('Extracted text content');
      expect(result.userId).toBe('user-1');
    });

    it('should invoke progress callbacks during upload workflow', async () => {
      const file = createMockFile('doc.txt', 512, 'text/plain');
      const userId = 'user-1';
      const progressUpdates: UploadProgress[] = [];
      const onProgress = vi.fn((progress: UploadProgress) => {
        progressUpdates.push({ ...progress });
      });

      mockedValidate.mockReturnValue({ valid: true });
      mockedGetDocumentCount.mockReturnValue(0);
      mockedExtract.mockResolvedValue({
        success: true,
        text: 'Some text',
      });

      await DocumentManager.uploadAndExtract(file, userId, onProgress);

      expect(onProgress).toHaveBeenCalled();

      const statuses = progressUpdates.map((p) => p.status);
      expect(statuses).toContain('validating');
      expect(statuses).toContain('extracting');
      expect(statuses).toContain('complete');
    });

    it('should return error and invoke progress with error status when validation fails', async () => {
      const file = createMockFile('bad.exe', 1024, 'application/x-msdownload');
      const userId = 'user-1';
      const onProgress = vi.fn();

      mockedValidate.mockReturnValue({
        valid: false,
        error: 'File type not supported',
      });

      await expect(
        DocumentManager.uploadAndExtract(file, userId, onProgress),
      ).rejects.toThrow();

      expect(mockedExtract).not.toHaveBeenCalled();
      expect(mockedSaveDocument).not.toHaveBeenCalled();

      const errorCall = onProgress.mock.calls.find(
        (call) => call[0].status === 'error',
      );
      expect(errorCall).toBeDefined();
    });

    it('should handle extraction failure', async () => {
      const file = createMockFile('corrupt.pdf', 2048, 'application/pdf');
      const userId = 'user-1';
      const onProgress = vi.fn();

      mockedValidate.mockReturnValue({ valid: true });
      mockedGetDocumentCount.mockReturnValue(0);
      mockedExtract.mockResolvedValue({
        success: false,
        text: '',
        error: 'Failed to extract text from PDF',
      });

      await expect(
        DocumentManager.uploadAndExtract(file, userId, onProgress),
      ).rejects.toThrow();

      expect(mockedSaveDocument).not.toHaveBeenCalled();

      const errorCall = onProgress.mock.calls.find(
        (call) => call[0].status === 'error',
      );
      expect(errorCall).toBeDefined();
    });

    it('should reject when document count exceeds maximum per user', async () => {
      const file = createMockFile('extra.pdf', 1024, 'application/pdf');
      const userId = 'user-1';
      const onProgress = vi.fn();

      mockedValidate.mockReturnValue({ valid: true });
      mockedGetDocumentCount.mockReturnValue(20);

      await expect(
        DocumentManager.uploadAndExtract(file, userId, onProgress),
      ).rejects.toThrow();

      expect(mockedExtract).not.toHaveBeenCalled();
      expect(mockedSaveDocument).not.toHaveBeenCalled();
    });

    it('should save document with correct metadata on success', async () => {
      const file = createMockFile('notes.txt', 256, 'text/plain');
      const userId = 'user-2';
      const onProgress = vi.fn();

      mockedValidate.mockReturnValue({ valid: true });
      mockedGetDocumentCount.mockReturnValue(5);
      mockedExtract.mockResolvedValue({
        success: true,
        text: 'Note content here',
      });

      const result = await DocumentManager.uploadAndExtract(file, userId, onProgress);

      expect(result.id).toBe('test-id-123');
      expect(result.fileName).toBe('notes.txt');
      expect(result.fileType).toBe('text/plain');
      expect(result.fileSize).toBe(256);
      expect(result.userId).toBe('user-2');
      expect(result.extractedText).toBe('Note content here');
      expect(typeof result.timestamp).toBe('number');

      expect(mockedSaveDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id-123',
          fileName: 'notes.txt',
          userId: 'user-2',
        }),
      );
    });
  });

  describe('listDocuments', () => {
    it('should delegate to LocalStorageRepository and return documents', () => {
      const mockDocs: DocumentEntry[] = [
        {
          id: 'doc-1',
          fileName: 'file1.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          timestamp: Date.now(),
          extractedText: 'Text 1',
          userId: 'user-1',
        },
        {
          id: 'doc-2',
          fileName: 'file2.txt',
          fileType: 'text/plain',
          fileSize: 512,
          timestamp: Date.now(),
          extractedText: 'Text 2',
          userId: 'user-1',
        },
      ];

      mockedListDocuments.mockReturnValue(mockDocs);

      const result = DocumentManager.listDocuments('user-1');

      expect(mockedListDocuments).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockDocs);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no documents exist', () => {
      mockedListDocuments.mockReturnValue([]);

      const result = DocumentManager.listDocuments('user-new');

      expect(mockedListDocuments).toHaveBeenCalledWith('user-new');
      expect(result).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('should delegate to LocalStorageRepository and return the document', () => {
      const mockDoc: DocumentEntry = {
        id: 'doc-1',
        fileName: 'report.pdf',
        fileType: 'application/pdf',
        fileSize: 2048,
        timestamp: Date.now(),
        extractedText: 'Report content',
        userId: 'user-1',
      };

      mockedGetDocument.mockReturnValue(mockDoc);

      const result = DocumentManager.getDocument('user-1', 'doc-1');

      expect(mockedGetDocument).toHaveBeenCalledWith('user-1', 'doc-1');
      expect(result).toEqual(mockDoc);
    });

    it('should return null when document does not exist', () => {
      mockedGetDocument.mockReturnValue(null);

      const result = DocumentManager.getDocument('user-1', 'nonexistent');

      expect(mockedGetDocument).toHaveBeenCalledWith('user-1', 'nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('deleteDocument', () => {
    it('should delegate deletion to LocalStorageRepository', () => {
      DocumentManager.deleteDocument('user-1', 'doc-1');

      expect(mockedDeleteDocument).toHaveBeenCalledWith('user-1', 'doc-1');
    });

    it('should call deleteDocument with correct userId and docId', () => {
      DocumentManager.deleteDocument('user-42', 'doc-abc');

      expect(mockedDeleteDocument).toHaveBeenCalledTimes(1);
      expect(mockedDeleteDocument).toHaveBeenCalledWith('user-42', 'doc-abc');
    });
  });
});