import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts text content from a PDF file using pdf.js.
 * Loads the PDF, iterates through all pages, extracts text items,
 * and returns the concatenated text.
 *
 * @param file - The PDF File object to extract text from
 * @returns A promise that resolves to the extracted text string
 * @throws Error if the PDF cannot be loaded or text extraction fails
 */
export async function extractFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item): item is { str: string; hasEOL: boolean; dir: string; width: number; height: number; transform: number[] } => 'str' in item)
      .map((item) => item.str)
      .join(' ');

    pageTexts.push(pageText);
  }

  return pageTexts.join('\n');
}