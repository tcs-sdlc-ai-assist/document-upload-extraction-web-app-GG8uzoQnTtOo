export function cleanText(raw: string): string {
  let text = raw;

  // Strip null characters
  text = text.replace(/\0/g, '');

  // Normalize line breaks to \n
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/\r/g, '\n');

  // Replace tabs with a single space
  text = text.replace(/\t/g, ' ');

  // Collapse multiple spaces into one (but preserve newlines)
  text = text.replace(/[^\S\n]+/g, ' ');

  // Collapse three or more consecutive newlines into two
  text = text.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace from each line
  text = text
    .split('\n')
    .map((line) => line.trim())
    .join('\n');

  // Trim leading and trailing whitespace
  text = text.trim();

  return text;
}