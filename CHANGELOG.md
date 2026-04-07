# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-15

### Added

- **Frontend-Only Authentication**
  - User registration (signup) with username and password
  - User login with SHA-256 password hashing via Web Crypto API
  - Session persistence using localStorage
  - Protected routes with automatic redirect to login for unauthenticated users
  - Logout functionality with session cleanup

- **Document Upload**
  - Drag-and-drop file upload interface with visual feedback
  - Traditional file picker as an alternative upload method
  - Support for PDF, DOCX, and TXT file formats
  - File size validation with a configurable maximum (default 10MB)
  - File type validation against allowed MIME types and extensions
  - Real-time upload progress indicator with accessible status messages
  - Maximum of 20 documents per user

- **Automatic Text Extraction**
  - PDF text extraction using pdfjs-dist library
  - DOCX text extraction using mammoth.js library
  - Plain text file content extraction with encoding support
  - Post-extraction text normalization and cleaning (whitespace, line breaks, null characters)
  - Retry logic for failed extractions with configurable retry count

- **localStorage Persistence**
  - User-scoped document storage with unique storage keys per user
  - Document metadata storage including file name, type, size, and timestamp
  - Extracted text content persistence alongside document metadata
  - Session state persistence across browser refreshes

- **Dashboard**
  - Overview page displaying upload statistics and document counts
  - File type distribution summary
  - Quick action links to upload and history pages
  - Recent documents list with metadata preview

- **Document History**
  - Chronological list of all uploaded documents
  - Document metadata display (file name, type, size, upload date)
  - Expandable rows to view extracted text content
  - Document deletion with confirmation prompt
  - Text content truncation with expand/collapse functionality

- **Responsive and Accessible UI**
  - Mobile-first responsive design using Tailwind CSS
  - Collapsible sidebar navigation with hamburger menu toggle
  - Keyboard-navigable interface with visible focus indicators
  - ARIA attributes for screen reader compatibility
  - Accessible progress indicators and status messages
  - Smooth animations and transitions for UI state changes

- **Error Handling**
  - Global error boundary for graceful error recovery
  - Client-side error logging to localStorage for debugging
  - User-friendly error messages for validation and extraction failures
  - Dismissible status messages for success, error, warning, and info states

- **Developer Experience**
  - Vite-powered development server with hot module replacement
  - TypeScript strict mode for type safety across the codebase
  - Path aliases (`@/`) for clean import paths
  - Unit tests with Vitest and Testing Library
  - Environment variable configuration via `.env` files
  - Vercel deployment configuration with SPA routing support