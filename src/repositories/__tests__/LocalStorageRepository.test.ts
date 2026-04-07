import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as LocalStorageRepository from '@/repositories/LocalStorageRepository';
import { DocumentEntry } from '@/types';
import { STORAGE_KEYS, MAX_DOCUMENTS_PER_USER } from '@/constants';

function createMockDocument(overrides: Partial<DocumentEntry> = {}): DocumentEntry {
  return {
    id: 'test-doc-1',
    fileName: 'test.pdf',
    fileType: 'application/pdf',
    fileSize: 1024,
    timestamp: Date.now(),
    extractedText: 'Extracted text content',
    userId: 'user1',
    ...overrides,
  };
}

describe('LocalStorageRepository', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('saveDocument', () => {
    it('saves a document to localStorage', () => {
      const doc = createMockDocument();
      LocalStorageRepository.saveDocument(doc);

      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toHaveLength(1);
      expect(documents[0]).toEqual(doc);
    });

    it('saves multiple documents for the same user', () => {
      const doc1 = createMockDocument({ id: 'doc-1', fileName: 'file1.pdf' });
      const doc2 = createMockDocument({ id: 'doc-2', fileName: 'file2.pdf' });

      LocalStorageRepository.saveDocument(doc1);
      LocalStorageRepository.saveDocument(doc2);

      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toHaveLength(2);
      expect(documents[0].id).toBe('doc-1');
      expect(documents[1].id).toBe('doc-2');
    });

    it('enforces maximum documents per user limit', () => {
      for (let i = 0; i < MAX_DOCUMENTS_PER_USER; i++) {
        const doc = createMockDocument({ id: `doc-${i}`, fileName: `file${i}.pdf` });
        LocalStorageRepository.saveDocument(doc);
      }

      const extraDoc = createMockDocument({ id: 'doc-extra', fileName: 'extra.pdf' });

      expect(() => LocalStorageRepository.saveDocument(extraDoc)).toThrow();
    });
  });

  describe('listDocuments', () => {
    it('returns an empty array when no documents exist', () => {
      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toEqual([]);
    });

    it('returns all documents for a given user', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });

      LocalStorageRepository.saveDocument(doc1);
      LocalStorageRepository.saveDocument(doc2);

      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toHaveLength(2);
    });

    it('returns an empty array for corrupted localStorage data', () => {
      const storageKey = `${STORAGE_KEYS.documents}_user1`;
      localStorage.setItem(storageKey, 'invalid-json');

      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toEqual([]);
    });
  });

  describe('getDocument', () => {
    it('returns a document by id', () => {
      const doc = createMockDocument({ id: 'doc-find-me' });
      LocalStorageRepository.saveDocument(doc);

      const found = LocalStorageRepository.getDocument('user1', 'doc-find-me');
      expect(found).not.toBeNull();
      expect(found!.id).toBe('doc-find-me');
      expect(found!.fileName).toBe('test.pdf');
    });

    it('returns null when document does not exist', () => {
      const found = LocalStorageRepository.getDocument('user1', 'nonexistent');
      expect(found).toBeNull();
    });

    it('returns null when searching in wrong user scope', () => {
      const doc = createMockDocument({ id: 'doc-1', userId: 'user1' });
      LocalStorageRepository.saveDocument(doc);

      const found = LocalStorageRepository.getDocument('user2', 'doc-1');
      expect(found).toBeNull();
    });
  });

  describe('deleteDocument', () => {
    it('deletes a document by id', () => {
      const doc = createMockDocument({ id: 'doc-to-delete' });
      LocalStorageRepository.saveDocument(doc);

      expect(LocalStorageRepository.listDocuments('user1')).toHaveLength(1);

      LocalStorageRepository.deleteDocument('user1', 'doc-to-delete');

      expect(LocalStorageRepository.listDocuments('user1')).toHaveLength(0);
    });

    it('does not throw when deleting a nonexistent document', () => {
      expect(() => {
        LocalStorageRepository.deleteDocument('user1', 'nonexistent');
      }).not.toThrow();
    });

    it('only deletes the specified document', () => {
      const doc1 = createMockDocument({ id: 'doc-1' });
      const doc2 = createMockDocument({ id: 'doc-2' });
      const doc3 = createMockDocument({ id: 'doc-3' });

      LocalStorageRepository.saveDocument(doc1);
      LocalStorageRepository.saveDocument(doc2);
      LocalStorageRepository.saveDocument(doc3);

      LocalStorageRepository.deleteDocument('user1', 'doc-2');

      const documents = LocalStorageRepository.listDocuments('user1');
      expect(documents).toHaveLength(2);
      expect(documents.find((d) => d.id === 'doc-2')).toBeUndefined();
      expect(documents.find((d) => d.id === 'doc-1')).toBeDefined();
      expect(documents.find((d) => d.id === 'doc-3')).toBeDefined();
    });
  });

  describe('user-scoped storage isolation', () => {
    it('isolates documents between different users', () => {
      const docUser1 = createMockDocument({ id: 'doc-u1', userId: 'user1' });
      const docUser2 = createMockDocument({ id: 'doc-u2', userId: 'user2' });

      LocalStorageRepository.saveDocument(docUser1);
      LocalStorageRepository.saveDocument(docUser2);

      const user1Docs = LocalStorageRepository.listDocuments('user1');
      const user2Docs = LocalStorageRepository.listDocuments('user2');

      expect(user1Docs).toHaveLength(1);
      expect(user1Docs[0].id).toBe('doc-u1');

      expect(user2Docs).toHaveLength(1);
      expect(user2Docs[0].id).toBe('doc-u2');
    });

    it('deleting a document for one user does not affect another user', () => {
      const docUser1 = createMockDocument({ id: 'shared-id', userId: 'user1' });
      const docUser2 = createMockDocument({ id: 'shared-id', userId: 'user2' });

      LocalStorageRepository.saveDocument(docUser1);
      LocalStorageRepository.saveDocument(docUser2);

      LocalStorageRepository.deleteDocument('user1', 'shared-id');

      expect(LocalStorageRepository.listDocuments('user1')).toHaveLength(0);
      expect(LocalStorageRepository.listDocuments('user2')).toHaveLength(1);
    });
  });

  describe('getDocumentCount', () => {
    it('returns 0 when no documents exist', () => {
      expect(LocalStorageRepository.getDocumentCount('user1')).toBe(0);
    });

    it('returns the correct count of documents', () => {
      LocalStorageRepository.saveDocument(createMockDocument({ id: 'doc-1' }));
      LocalStorageRepository.saveDocument(createMockDocument({ id: 'doc-2' }));
      LocalStorageRepository.saveDocument(createMockDocument({ id: 'doc-3' }));

      expect(LocalStorageRepository.getDocumentCount('user1')).toBe(3);
    });

    it('returns correct count after deletion', () => {
      LocalStorageRepository.saveDocument(createMockDocument({ id: 'doc-1' }));
      LocalStorageRepository.saveDocument(createMockDocument({ id: 'doc-2' }));

      LocalStorageRepository.deleteDocument('user1', 'doc-1');

      expect(LocalStorageRepository.getDocumentCount('user1')).toBe(1);
    });
  });

  describe('storage quota handling', () => {
    it('handles localStorage setItem throwing a quota error', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
        throw error;
      });

      const doc = createMockDocument();

      expect(() => LocalStorageRepository.saveDocument(doc)).toThrow();

      setItemSpy.mockRestore();
    });
  });
});