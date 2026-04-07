import { ExtractionResult } from '@/types';
import { EXTRACTION_MAX_RETRIES } from '@/constants';
import { extractFromPdf } from '@/services/extractors/PdfExtractor';
import { extractFromDocx } from '@/services/extractors/DocxExtractor';
import { extractFromTxt } from '@/services/extractors/TxtExtractor';
import { logError } from '@/utils/ErrorLogger';

function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

function getMimeType(file: File): string {
  return file.type.toLowerCase();
}

type ExtractorFn = (file: File) => Promise<string>;

function resolveExtractor(file: File): ExtractorFn | null {
  const extension = getFileExtension(file.name);
  const mimeType = getMimeType(file);

  if (
    extension === '.pdf' ||
    mimeType === 'application/pdf'
  ) {
    return extractFromPdf;
  }

  if (
    extension === '.docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractFromDocx;
  }

  if (
    extension === '.txt' ||
    mimeType === 'text/plain'
  ) {
    return extractFromTxt;
  }

  return null;
}

export async function extractText(file: File): Promise<ExtractionResult> {
  const extractor = resolveExtractor(file);

  if (!extractor) {
    const errorMessage = `Unsupported file type: ${file.name} (${file.type})`;
    logError('Extractor', errorMessage, { fileName: file.name, mimeType: file.type });
    return {
      success: false,
      text: '',
      error: errorMessage,
    };
  }

  const maxAttempts = 1 + EXTRACTION_MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const text = await extractor(file);
      return {
        success: true,
        text,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      logError('Extractor', lastError, {
        fileName: file.name,
        mimeType: file.type,
        attempt,
        maxAttempts,
      });

      if (attempt < maxAttempts) {
        // Brief delay before retry
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }

  const errorMessage = `Failed to extract text from "${file.name}" after ${maxAttempts} attempt${maxAttempts > 1 ? 's' : ''}.${lastError ? ` ${lastError.message}` : ''}`;

  return {
    success: false,
    text: '',
    error: errorMessage,
  };
}