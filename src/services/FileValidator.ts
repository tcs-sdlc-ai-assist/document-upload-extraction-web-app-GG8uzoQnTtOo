import { FileValidationResult } from '@/types';
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, ALLOWED_FILE_TYPES } from '@/constants';

const MAX_FILE_SIZE_MB = MAX_FILE_SIZE_BYTES / (1024 * 1024);

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

export function validate(file: File): FileValidationResult {
  if (!file) {
    return {
      valid: false,
      error: 'No file provided.',
    };
  }

  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  const isAllowedMime = ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
  const isAllowedExtension = ALLOWED_EXTENSIONS.includes(extension as typeof ALLOWED_EXTENSIONS[number]);

  if (!isAllowedMime && !isAllowedExtension) {
    const allowedLabels = ALLOWED_FILE_TYPES.map((ft) => ft.label).join(', ');
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedLabels}.`,
    };
  }

  if (!isAllowedMime || !isAllowedExtension) {
    const matchByMime = ALLOWED_FILE_TYPES.find((ft) => ft.mimeType === mimeType);
    const matchByExt = ALLOWED_FILE_TYPES.find((ft) => ft.extension === extension);

    if (matchByMime && matchByExt && matchByMime !== matchByExt) {
      const allowedLabels = ALLOWED_FILE_TYPES.map((ft) => ft.label).join(', ');
      return {
        valid: false,
        error: `File extension does not match file type. Allowed types: ${allowedLabels}.`,
      };
    }

    if (!isAllowedMime && isAllowedExtension) {
      // Extension is valid but MIME type is not — allow it (some browsers report incorrect MIME types)
    } else if (isAllowedMime && !isAllowedExtension) {
      const allowedLabels = ALLOWED_FILE_TYPES.map((ft) => ft.label).join(', ');
      return {
        valid: false,
        error: `Invalid file extension. Allowed types: ${allowedLabels}.`,
      };
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE_MB}MB.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty.',
    };
  }

  return {
    valid: true,
  };
}