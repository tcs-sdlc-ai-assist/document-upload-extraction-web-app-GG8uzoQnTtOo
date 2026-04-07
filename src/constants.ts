export const APP_NAME = import.meta.env.VITE_APP_NAME || 'DocuPex';

export const STORAGE_KEYS = {
  users: 'docupex_users',
  session: 'docupex_session',
  documents: 'docupex_documents',
  errorLogs: 'docupex_error_logs',
} as const;

const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10;
export const MAX_FILE_SIZE_BYTES = maxFileSizeMb * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  {
    extension: '.pdf',
    mimeType: 'application/pdf',
    label: 'PDF',
  },
  {
    extension: '.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    label: 'DOCX',
  },
  {
    extension: '.txt',
    mimeType: 'text/plain',
    label: 'TXT',
  },
] as const;

export const ALLOWED_MIME_TYPES = ALLOWED_FILE_TYPES.map((ft) => ft.mimeType);

export const ALLOWED_EXTENSIONS = ALLOWED_FILE_TYPES.map((ft) => ft.extension);

export const MAX_DOCUMENTS_PER_USER = 20;

export const EXTRACTION_MAX_RETRIES = 1;

export interface NavMenuItem {
  label: string;
  path: string;
  icon: string;
}

export const NAV_MENU_ITEMS: NavMenuItem[] = [
  {
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
  },
  {
    label: 'Upload',
    path: '/upload',
    icon: 'upload',
  },
  {
    label: 'History',
    path: '/history',
    icon: 'history',
  },
];