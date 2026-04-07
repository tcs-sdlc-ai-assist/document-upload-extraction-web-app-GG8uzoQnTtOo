import { cleanText } from '@/utils/textCleaner';

describe('cleanText', () => {
  it('returns empty string for empty input', () => {
    expect(cleanText('')).toBe('');
  });

  it('returns trimmed text for simple input', () => {
    expect(cleanText('hello world')).toBe('hello world');
  });

  it('strips null characters', () => {
    expect(cleanText('hello\0world')).toBe('helloworld');
    expect(cleanText('\0\0test\0')).toBe('test');
  });

  it('normalizes \\r\\n line breaks to \\n', () => {
    const input = 'line one\r\nline two\r\nline three';
    const result = cleanText(input);
    expect(result).toBe('line one\nline two\nline three');
    expect(result).not.toContain('\r');
  });

  it('normalizes standalone \\r to \\n', () => {
    const input = 'line one\rline two\rline three';
    const result = cleanText(input);
    expect(result).toBe('line one\nline two\nline three');
  });

  it('replaces tabs with a single space', () => {
    const input = 'hello\tworld';
    expect(cleanText(input)).toBe('hello world');
  });

  it('collapses multiple spaces into one', () => {
    const input = 'hello     world';
    expect(cleanText(input)).toBe('hello world');
  });

  it('collapses multiple spaces while preserving single newlines', () => {
    const input = 'hello   world\ngoodbye   world';
    expect(cleanText(input)).toBe('hello world\ngoodbye world');
  });

  it('collapses three or more consecutive newlines into two', () => {
    const input = 'paragraph one\n\n\nparagraph two';
    expect(cleanText(input)).toBe('paragraph one\n\nparagraph two');
  });

  it('collapses many consecutive newlines into two', () => {
    const input = 'paragraph one\n\n\n\n\n\nparagraph two';
    expect(cleanText(input)).toBe('paragraph one\n\nparagraph two');
  });

  it('preserves double newlines (paragraph breaks)', () => {
    const input = 'paragraph one\n\nparagraph two';
    expect(cleanText(input)).toBe('paragraph one\n\nparagraph two');
  });

  it('trims whitespace from each line', () => {
    const input = '  hello  \n  world  ';
    expect(cleanText(input)).toBe('hello\nworld');
  });

  it('trims leading and trailing whitespace from the entire string', () => {
    const input = '   hello world   ';
    expect(cleanText(input)).toBe('hello world');
  });

  it('handles a combination of all transformations', () => {
    const input = '  \0hello\t\t  world  \r\n  foo\0   bar  \n\n\n\n  baz  ';
    const result = cleanText(input);
    expect(result).toBe('hello world\nfoo bar\n\nbaz');
  });

  it('handles input with only whitespace', () => {
    expect(cleanText('   \t\t  \n\n  ')).toBe('');
  });

  it('handles input with only null characters', () => {
    expect(cleanText('\0\0\0')).toBe('');
  });

  it('handles input with mixed line break styles', () => {
    const input = 'line1\r\nline2\rline3\nline4';
    const result = cleanText(input);
    expect(result).toBe('line1\nline2\nline3\nline4');
  });
});