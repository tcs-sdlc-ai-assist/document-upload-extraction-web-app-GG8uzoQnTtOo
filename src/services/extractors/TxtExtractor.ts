import { cleanText } from '@/utils/textCleaner';

export async function extractFromTxt(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const rawText = reader.result as string;
        const cleaned = cleanText(rawText);
        resolve(cleaned);
      } catch (error) {
        reject(new Error(`Failed to process TXT file: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read TXT file: ${reader.error?.message ?? 'Unknown read error'}`));
    };

    reader.readAsText(file);
  });
}