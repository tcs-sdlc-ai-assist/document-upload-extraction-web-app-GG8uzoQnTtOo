import React, { useState, useRef, useCallback } from 'react';
import { useDocuments } from '@/contexts/DocumentContext';
import { validate } from '@/services/FileValidator';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { StatusMessage, StatusMessageType } from '@/components/StatusMessage';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from '@/constants';

interface StatusInfo {
  type: StatusMessageType;
  message: string;
}

export const UploadComponent: React.FC = () => {
  const { uploadDocument, uploadProgress } = useDocuments();
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState<StatusInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const maxFileSizeMb = Math.round(MAX_FILE_SIZE_BYTES / (1024 * 1024));
  const acceptedExtensions = ALLOWED_FILE_TYPES.map((ft) => ft.extension).join(', ');
  const acceptedMimeTypes = ALLOWED_FILE_TYPES.map((ft) => ft.mimeType).join(',');

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      clearStatus();

      const validation = validate(file);
      if (!validation.valid) {
        setStatus({ type: 'error', message: validation.error ?? 'Invalid file.' });
        return;
      }

      try {
        await uploadDocument(file);
        setStatus({ type: 'success', message: `"${file.name}" uploaded and extracted successfully.` });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
        setStatus({ type: 'error', message });
      }
    },
    [uploadDocument, clearStatus],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
      // Reset input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [processFile],
  );

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    // Only set drag over to false if we're leaving the drop zone itself
    const relatedTarget = event.relatedTarget as Node | null;
    if (dropZoneRef.current && !dropZoneRef.current.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        processFile(files[0]);
      }
    },
    [processFile],
  );

  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleBrowseClick();
      }
    },
    [handleBrowseClick],
  );

  const isUploading =
    uploadProgress.status === 'validating' ||
    uploadProgress.status === 'extracting' ||
    uploadProgress.status === 'saving';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Upload Document</h2>
        <p className="text-neutral-500 text-sm">
          Supported formats: {ALLOWED_FILE_TYPES.map((ft) => ft.label).join(', ')} — Max size: {maxFileSizeMb}MB
        </p>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label="Upload document. Drag and drop a file here or press Enter to browse."
        aria-describedby="upload-description"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        onKeyDown={handleKeyDown}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[200px] p-8
          border-2 border-dashed rounded-2xl
          cursor-pointer
          transition-all duration-250 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
          ${
            isDragOver
              ? 'border-brand-500 bg-brand-50 shadow-focus'
              : 'border-neutral-300 bg-white hover:border-brand-400 hover:bg-neutral-50'
          }
          ${isUploading ? 'pointer-events-none opacity-60' : ''}
        `}
      >
        {/* Upload Icon */}
        <div
          className={`
            mb-4 flex items-center justify-center w-16 h-16 rounded-full
            transition-colors duration-200
            ${isDragOver ? 'bg-brand-100 text-brand-600' : 'bg-neutral-100 text-neutral-400'}
          `}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <p className="text-neutral-700 font-medium text-base mb-1">
          {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
        </p>
        <p className="text-neutral-400 text-sm mb-4">or</p>
        <span
          className="inline-flex items-center px-5 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg
            hover:bg-brand-700 transition-colors duration-200 focus:outline-none"
          aria-hidden="true"
        >
          Browse Files
        </span>

        <p id="upload-description" className="sr-only">
          Accepted file types: {acceptedExtensions}. Maximum file size: {maxFileSizeMb} megabytes.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedMimeTypes}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Progress Indicator */}
      {uploadProgress.status !== 'idle' && (
        <div className="animate-fade-in">
          <ProgressIndicator uploadProgress={uploadProgress} />
        </div>
      )}

      {/* Status Message */}
      {status && (
        <div className="animate-slide-up">
          <StatusMessage type={status.type} message={status.message} onDismiss={clearStatus} />
        </div>
      )}
    </div>
  );
};

export default UploadComponent;