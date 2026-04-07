import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/services/extractors/PdfExtractor', () => ({
  extractFromPdf: vi.fn(),
}));

vi.mock('@/services/extractors/DocxExtractor', () => ({
  extractFromDocx: vi.fn(),
}));

vi.mock('@/services/extractors/TxtExtractor', () => ({
  extractFromTxt: vi.fn(),
}));

vi.mock('@/utils/ErrorLogger', () => ({
  logError: vi.fn(),
}));

import { extractText } from '@/services/Extractor';
import { extractFromPdf } from '@/services/extractors/PdfExtractor';
import { extractFromDocx } from '@/services/extractors/DocxExtractor';
import { extractFromTxt } from '@/services/extractors/TxtExtractor';
import { logError } from '@/utils/ErrorLogger';
import { ExtractionResult } from '@/types';

function createMockFile(name: string, type: string, content: string = 'test'): File {
  const blob = new Blob([content], { type });
  return new File([blob], name, { type });
}

describe('Extractor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('file type routing', () => {
    it('routes PDF files to PdfExtractor', async () => {
      const mockText = 'Extracted PDF text';
      vi.mocked(extractFromPdf).mockResolvedValue(mockText);

      const file = createMockFile('document.pdf', 'application/pdf');
      const result: ExtractionResult = await extractText(file);

      expect(result.success).toBe(true);
      expect(result.text).toBe(mockText);
      expect(extractFromPdf).toHaveBeenCalledWith(file);
      expect(extractFromDocx).not.toHaveBeenCalled();
      expect(extractFromTxt).not.toHaveBeenCalled();
    });

    it('routes DOCX files to DocxExtractor', async () => {
      const mockText = 'Extracted DOCX text';
      vi.mocked(extractFromDocx).mockResolvedValue(mockText);

      const file = createMockFile(
        'document.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      const result: ExtractionResult = await extractText(file);

      expect(result.success).toBe(true);
      expect(result.text).toBe(mockText);
      expect(extractFromDocx).toHaveBeenCalledWith(file);
      expect(extractFromPdf).not.toHaveBeenCalled();
      expect(extractFromTxt).not.toHaveBeenCalled();
    });

    it('routes TXT files to TxtExtractor', async () => {
      const mockText = 'Extracted TXT text';
      vi.mocked(extractFromTxt).mockResolvedValue(mockText);

      const file = createMockFile('document.txt', 'text/plain');
      const result: ExtractionResult = await extractText(file);

      expect(result.success).toBe(true);
      expect(result.text).toBe(mockText);
      expect(extractFromTxt).toHaveBeenCalledWith(file);
      expect(extractFromPdf).not.toHaveBeenCalled();
      expect(extractFromDocx).not.toHaveBeenCalled();
    });
  });

  describe('ExtractionResult structure', () => {
    it('returns success result with extracted text', async () => {
      const mockText = 'Some extracted content';
      vi.mocked(extractFromTxt).mockResolvedValue(mockText);

      const file = createMockFile('test.txt', 'text/plain');
      const result = await extractText(file);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('text');
      expect(result.success).toBe(true);
      expect(result.text).toBe(mockText);
      expect(result.error).toBeUndefined();
    });

    it('returns error result on failure', async () => {
      vi.mocked(extractFromTxt).mockRejectedValue(new Error('Read failed'));

      const file = createMockFile('test.txt', 'text/plain');
      const result = await extractText(file);

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('text');
      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBeDefined();
    });
  });

  describe('unsupported file types', () => {
    it('returns error for unsupported file type', async () => {
      const file = createMockFile('image.png', 'image/png');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBeDefined();
      expect(extractFromPdf).not.toHaveBeenCalled();
      expect(extractFromDocx).not.toHaveBeenCalled();
      expect(extractFromTxt).not.toHaveBeenCalled();
    });

    it('returns error for file with no extension', async () => {
      const file = createMockFile('noextension', 'application/octet-stream');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBeDefined();
    });
  });

  describe('retry logic', () => {
    it('retries extraction on first failure and succeeds on second attempt', async () => {
      const mockText = 'Extracted after retry';
      vi.mocked(extractFromPdf)
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce(mockText);

      const file = createMockFile('document.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(true);
      expect(result.text).toBe(mockText);
      expect(extractFromPdf).toHaveBeenCalledTimes(2);
    });

    it('returns error after all retry attempts are exhausted', async () => {
      vi.mocked(extractFromPdf)
        .mockRejectedValueOnce(new Error('Failure 1'))
        .mockRejectedValueOnce(new Error('Failure 2'));

      const file = createMockFile('document.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBeDefined();
      expect(extractFromPdf).toHaveBeenCalledTimes(2);
    });
  });

  describe('error logging', () => {
    it('logs error when extraction fails after all retries', async () => {
      vi.mocked(extractFromDocx)
        .mockRejectedValueOnce(new Error('DOCX parse error'))
        .mockRejectedValueOnce(new Error('DOCX parse error again'));

      const file = createMockFile(
        'document.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      await extractText(file);

      expect(logError).toHaveBeenCalled();
    });

    it('does not log error when extraction succeeds on first attempt', async () => {
      vi.mocked(extractFromTxt).mockResolvedValue('Success text');

      const file = createMockFile('document.txt', 'text/plain');
      await extractText(file);

      expect(logError).not.toHaveBeenCalled();
    });

    it('does not log error when extraction succeeds on retry', async () => {
      vi.mocked(extractFromPdf)
        .mockRejectedValueOnce(new Error('Temp error'))
        .mockResolvedValueOnce('Recovered text');

      const file = createMockFile('document.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(true);
      expect(logError).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('handles empty extracted text', async () => {
      vi.mocked(extractFromTxt).mockResolvedValue('');

      const file = createMockFile('empty.txt', 'text/plain');
      const result = await extractText(file);

      expect(result.success).toBe(true);
      expect(result.text).toBe('');
    });

    it('handles extractor throwing non-Error objects', async () => {
      vi.mocked(extractFromPdf)
        .mockRejectedValueOnce('string error')
        .mockRejectedValueOnce('string error again');

      const file = createMockFile('document.pdf', 'application/pdf');
      const result = await extractText(file);

      expect(result.success).toBe(false);
      expect(result.text).toBe('');
      expect(result.error).toBeDefined();
    });
  });
});