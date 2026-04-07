import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/contexts/DocumentContext';
import { useSession } from '@/contexts/SessionContext';
import { DocumentEntry } from '@/types';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1);
  return `${size} ${units[i]}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getFileTypeLabel(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'PDF';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'DOCX';
    case 'text/plain':
      return 'TXT';
    default:
      return fileType;
  }
}

function getFileTypeColor(fileType: string): string {
  switch (fileType) {
    case 'application/pdf':
      return 'bg-danger-50 text-danger-700';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return 'bg-brand-50 text-brand-700';
    case 'text/plain':
      return 'bg-success-50 text-success-700';
    default:
      return 'bg-neutral-100 text-neutral-700';
  }
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { documents, isLoading } = useDocuments();
  const { session } = useSession();

  const totalDocuments = documents.length;

  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  const fileTypeCounts = documents.reduce<Record<string, number>>((acc, doc) => {
    const label = getFileTypeLabel(doc.fileType);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  const recentDocuments: DocumentEntry[] = [...documents]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64" role="status" aria-label="Loading dashboard">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
          <p className="text-neutral-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto" role="main" aria-label="Dashboard">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        {session && (
          <p className="mt-1 text-neutral-500 text-sm sm:text-base">
            Welcome back, <span className="font-medium text-neutral-700">{session.username}</span>
          </p>
        )}
      </div>

      {/* Statistics Cards */}
      <section aria-label="Upload statistics" className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Documents */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-sm font-medium text-neutral-500">Total Documents</h2>
            </div>
            <p className="text-3xl font-semibold text-neutral-900">{totalDocuments}</p>
          </div>

          {/* Total Storage */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h2 className="text-sm font-medium text-neutral-500">Total Size</h2>
            </div>
            <p className="text-3xl font-semibold text-neutral-900">{formatFileSize(totalSize)}</p>
          </div>

          {/* File Types Breakdown */}
          <div className="bg-white rounded-xl border border-neutral-200 p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-warning-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-sm font-medium text-neutral-500">File Types</h2>
            </div>
            {Object.keys(fileTypeCounts).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Object.entries(fileTypeCounts).map(([type, count]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-neutral-100 text-neutral-700"
                  >
                    {type}
                    <span className="bg-neutral-200 text-neutral-600 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400 text-sm">No documents yet</p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section aria-label="Quick actions" className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/upload')}
            className="flex items-center gap-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl p-5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-base font-semibold">Upload Document</span>
              <span className="block text-sm text-white/80">Upload PDF, DOCX, or TXT files</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="flex items-center gap-4 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-200 rounded-xl p-5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
            type="button"
          >
            <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <span className="block text-base font-semibold">View History</span>
              <span className="block text-sm text-neutral-500">Browse all uploaded documents</span>
            </div>
          </button>
        </div>
      </section>

      {/* Recent Uploads */}
      <section aria-label="Recent uploads">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Uploads</h2>
          {totalDocuments > 5 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
              type="button"
            >
              View all →
            </button>
          )}
        </div>

        {recentDocuments.length > 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden sm:table-cell">
                      Type
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                      Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-neutral-50 transition-colors duration-150">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold ${getFileTypeColor(doc.fileType)} sm:hidden`}>
                            {getFileTypeLabel(doc.fileType)}
                          </span>
                          <span className="text-sm font-medium text-neutral-900 truncate max-w-[200px] sm:max-w-xs">
                            {doc.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFileTypeColor(doc.fileType)}`}>
                          {getFileTypeLabel(doc.fileType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 hidden md:table-cell">
                        {formatFileSize(doc.fileSize)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-500 whitespace-nowrap">
                        {formatTimestamp(doc.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H12.75V15zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM9 12.75h.008v.008H9v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 3.75h.008v.008H9V16.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM6.75 9.75h.008v.008H6.75V9.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">No documents yet</h3>
            <p className="text-neutral-500 text-sm mb-6">
              Upload your first document to get started with text extraction.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

export default DashboardPage;