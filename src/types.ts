export interface User {
  username: string;
  passwordHash: string;
}

export interface Session {
  username: string;
  isAuthenticated: boolean;
  loginTimestamp: number;
}

export interface DocumentEntry {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  timestamp: number;
  extractedText: string;
  userId: string;
}

export interface ExtractionResult {
  success: boolean;
  text: string;
  error?: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export type UploadStatus = 'idle' | 'validating' | 'extracting' | 'saving' | 'complete' | 'error';

export interface UploadProgress {
  status: UploadStatus;
  progress: number;
  message: string;
}

export interface AppError {
  code: string;
  message: string;
  timestamp: number;
  context?: string;
}