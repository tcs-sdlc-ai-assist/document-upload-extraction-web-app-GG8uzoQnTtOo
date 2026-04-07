# Docupex

A client-side document processing and text extraction application built with React and TypeScript. Upload PDF, DOCX, or TXT files and automatically extract their text content — all processing happens in the browser with no server required.

## Features

- **Document Upload** — Drag & drop or file picker interface with real-time progress tracking
- **Text Extraction** — Automatic text extraction from PDF, DOCX, and TXT files using pdf.js and mammoth.js
- **Document History** — Browse, view, and manage previously uploaded documents and their extracted content
- **Dashboard** — Overview of upload statistics and quick actions
- **Authentication** — Demo authentication system with signup/login using localStorage
- **User-Scoped Storage** — Each user's documents are stored separately in localStorage
- **File Validation** — Client-side validation for file type, size, and format before processing
- **Retry Logic** — Automatic retry on extraction failures with configurable retry count
- **Responsive Design** — Fully responsive layout with collapsible sidebar navigation
- **Accessibility** — ARIA attributes, keyboard navigation, focus management, and screen reader support
- **Error Handling** — Global error boundary, contextual error messages, and client-side error logging

## Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite 5
- **Styling:** Tailwind CSS 3
- **Routing:** React Router DOM 6
- **PDF Extraction:** pdfjs-dist
- **DOCX Extraction:** mammoth
- **Testing:** Vitest + React Testing Library
- **Deployment:** Vercel

## Folder Structure

```
docupex/
├── index.html                          # SPA HTML entry point
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
├── vite.config.ts                      # Vite build and dev server config
├── tailwind.config.js                  # Tailwind CSS theme configuration
├── postcss.config.js                   # PostCSS plugin configuration
├── vitest.setup.ts                     # Test environment setup
├── vercel.json                         # Vercel deployment configuration
├── .env.example                        # Environment variable template
├── src/
│   ├── main.tsx                        # Application entry point
│   ├── App.tsx                         # Root component with routing and providers
│   ├── types.ts                        # Shared TypeScript type definitions
│   ├── constants.ts                    # Application constants and configuration
│   ├── index.css                       # Global Tailwind CSS styles
│   ├── components/
│   │   ├── ErrorBoundary.tsx           # Global error boundary
│   │   ├── ProgressIndicator.tsx       # Upload progress visualization
│   │   ├── StatusMessage.tsx           # Status and error message display
│   │   ├── auth/
│   │   │   ├── LoginComponent.tsx      # Login form
│   │   │   └── SignupComponent.tsx     # Registration form
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Application header
│   │   │   ├── Sidebar.tsx            # Sidebar navigation
│   │   │   └── MainLayout.tsx         # Authenticated layout shell
│   │   ├── upload/
│   │   │   └── UploadComponent.tsx    # Document upload interface
│   │   └── history/
│   │       └── HistoryComponent.tsx   # Document history view
│   ├── contexts/
│   │   ├── SessionContext.tsx          # Authentication state management
│   │   └── DocumentContext.tsx         # Document state management
│   ├── pages/
│   │   ├── AuthPage.tsx               # Authentication page
│   │   ├── DashboardPage.tsx          # Dashboard overview page
│   │   ├── UploadPage.tsx             # Upload page
│   │   └── HistoryPage.tsx            # History page
│   ├── repositories/
│   │   ├── AuthRepository.ts          # Authentication data access (localStorage)
│   │   ├── LocalStorageRepository.ts  # Document data access (localStorage)
│   │   └── __tests__/
│   │       ├── AuthRepository.test.ts
│   │       └── LocalStorageRepository.test.ts
│   ├── services/
│   │   ├── DocumentManager.ts         # Document lifecycle orchestrator
│   │   ├── Extractor.ts              # Extraction orchestrator with retry logic
│   │   ├── FileValidator.ts          # File type and size validation
│   │   ├── extractors/
│   │   │   ├── PdfExtractor.ts       # PDF text extraction (pdf.js)
│   │   │   ├── DocxExtractor.ts      # DOCX text extraction (mammoth.js)
│   │   │   └── TxtExtractor.ts       # Plain text extraction
│   │   └── __tests__/
│   │       ├── DocumentManager.test.ts
│   │       ├── Extractor.test.ts
│   │       └── FileValidator.test.ts
│   └── utils/
│       ├── ErrorLogger.ts            # Client-side error logging
│       ├── textCleaner.ts            # Text normalization and cleaning
│       ├── hashPassword.ts           # Password hashing (SHA-256)
│       ├── generateId.ts             # Unique ID generation
│       └── __tests__/
│           └── textCleaner.test.ts
```

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later (or equivalent package manager)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd docupex

# Install dependencies
npm install
```

### Environment Variables

Copy the example environment file and adjust values as needed:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_NAME` | `DocuPex` | Application display name |
| `VITE_MAX_FILE_SIZE_MB` | `10` | Maximum upload file size in megabytes |

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build

Create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Testing

Run the test suite:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

Tests use Vitest with jsdom environment and React Testing Library. A localStorage mock is provided in `vitest.setup.ts` for consistent test behavior.

### Linting

```bash
npm run lint
```

## Supported File Types

| Format | Extension | MIME Type | Library |
|---|---|---|---|
| PDF | `.pdf` | `application/pdf` | pdfjs-dist |
| DOCX | `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | mammoth |
| Plain Text | `.txt` | `text/plain` | Native FileReader |

Maximum file size: **10 MB** (configurable via `VITE_MAX_FILE_SIZE_MB`).

## Authentication

Docupex uses a demo authentication system backed by localStorage. User credentials are hashed with SHA-256 via the Web Crypto API before storage. This is intended for demonstration purposes only and should not be used for production authentication.

- Passwords are hashed client-side using `crypto.subtle.digest('SHA-256', ...)`
- Sessions are persisted in localStorage and restored on page reload
- Each user's documents are stored under a user-scoped storage key

## Deployment

Docupex is configured for deployment on [Vercel](https://vercel.com). A `vercel.json` file is included with SPA rewrite rules.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

### Key deployment notes

- The `vercel.json` rewrites all routes to `index.html` for client-side routing
- No server-side environment variables are required — all config is embedded at build time via `VITE_*` variables
- Set environment variables in the Vercel dashboard under **Settings → Environment Variables**

## Accessibility

Docupex follows web accessibility best practices:

- **Semantic HTML** — Proper heading hierarchy, landmark regions, and form labels
- **ARIA Attributes** — `aria-label`, `aria-live`, `role`, and `aria-describedby` where appropriate
- **Keyboard Navigation** — All interactive elements are focusable and operable via keyboard
- **Focus Management** — Visible focus indicators using Tailwind's ring utilities
- **Status Announcements** — Upload progress and status messages use `aria-live` regions for screen reader announcements
- **Color Contrast** — Color palette designed to meet WCAG 2.1 AA contrast requirements
- **Responsive Design** — Fully usable across screen sizes with collapsible sidebar navigation

## Storage

All data is stored in the browser's localStorage:

| Key | Description |
|---|---|
| `docupex_users` | Registered user accounts |
| `docupex_session` | Current authentication session |
| `docupex_documents` | User-scoped document entries with extracted text |
| `docupex_error_logs` | Client-side error logs for debugging |

A maximum of **20 documents per user** is enforced to manage localStorage capacity.

## License

Private — All rights reserved.