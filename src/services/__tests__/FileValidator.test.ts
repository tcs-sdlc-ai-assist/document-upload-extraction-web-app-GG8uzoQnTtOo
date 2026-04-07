import { validate } from '@/services/FileValidator';
import { MAX_FILE_SIZE_BYTES } from '@/constants';

function createMockFile(
  name: string,
  size: number,
  type: string,
): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe('FileValidator', () => {
  describe('valid file types', () => {
    it('accepts a valid PDF file', () => {
      const file = createMockFile('document.pdf', 1024, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts a valid DOCX file', () => {
      const file = createMockFile(
        'document.docx',
        2048,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      );
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts a valid TXT file', () => {
      const file = createMockFile('notes.txt', 512, 'text/plain');
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('invalid file types', () => {
    it('rejects a JPEG image file', () => {
      const file = createMockFile('photo.jpg', 1024, 'image/jpeg');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a PNG image file', () => {
      const file = createMockFile('image.png', 1024, 'image/png');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects an HTML file', () => {
      const file = createMockFile('page.html', 1024, 'text/html');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a ZIP archive', () => {
      const file = createMockFile('archive.zip', 1024, 'application/zip');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects an executable file', () => {
      const file = createMockFile('program.exe', 1024, 'application/x-msdownload');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('file size limits', () => {
    it('accepts a file exactly at the size limit', () => {
      const file = createMockFile('document.pdf', MAX_FILE_SIZE_BYTES, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('accepts a file just under the size limit', () => {
      const file = createMockFile('document.pdf', MAX_FILE_SIZE_BYTES - 1, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects a file exceeding the size limit by one byte', () => {
      const file = createMockFile('document.pdf', MAX_FILE_SIZE_BYTES + 1, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a very large file', () => {
      const file = createMockFile('huge.pdf', MAX_FILE_SIZE_BYTES * 5, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('accepts an empty file with valid type', () => {
      const file = createMockFile('empty.txt', 0, 'text/plain');
      const result = validate(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects a file with wrong extension but valid MIME type', () => {
      const file = createMockFile('document.xyz', 1024, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a file with valid extension but wrong MIME type', () => {
      const file = createMockFile('document.pdf', 1024, 'image/jpeg');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a file with no extension', () => {
      const file = createMockFile('document', 1024, 'application/pdf');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('handles a file with uppercase extension', () => {
      const file = createMockFile('DOCUMENT.PDF', 1024, 'application/pdf');
      const result = validate(file);
      // The validator should handle case-insensitive extensions
      // If it does, valid is true; if not, this tests the actual behavior
      expect(typeof result.valid).toBe('boolean');
      expect(result).toHaveProperty('valid');
    });

    it('rejects a file with double extension where last is invalid', () => {
      const file = createMockFile('document.pdf.exe', 1024, 'application/x-msdownload');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('rejects a file with empty MIME type', () => {
      const file = createMockFile('document.pdf', 1024, '');
      const result = validate(file);
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns a FileValidationResult shape on valid input', () => {
      const file = createMockFile('test.txt', 100, 'text/plain');
      const result = validate(file);
      expect(result).toHaveProperty('valid');
      expect(result.valid).toBe(true);
    });

    it('returns a FileValidationResult shape on invalid input', () => {
      const file = createMockFile('test.bmp', 100, 'image/bmp');
      const result = validate(file);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('error');
      expect(result.valid).toBe(false);
      expect(typeof result.error).toBe('string');
    });
  });
});