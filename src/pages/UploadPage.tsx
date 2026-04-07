import React from 'react';
import UploadComponent from '@/components/upload/UploadComponent';

const UploadPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Upload Document</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Upload a PDF, DOCX, or TXT file to automatically extract its text content.
          Files up to 10MB are supported.
        </p>
      </div>
      <UploadComponent />
    </div>
  );
};

export default UploadPage;