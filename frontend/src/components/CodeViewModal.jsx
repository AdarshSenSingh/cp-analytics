import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// Modal for viewing code in a popup
export default function CodeViewModal({ open, onClose, code, language, problemTitle, loading = false, error = '' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative animate-fade-in">
  <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl" onClick={onClose} aria-label="Close Modal">&times;</button>
        <h2 className="text-xl font-bold mb-2 text-indigo-700 text-center">Submission Code</h2>
        <div className="mb-2 text-sm text-gray-700 font-semibold text-center">{problemTitle}</div>
        <div className="border rounded bg-gray-900 text-white overflow-x-auto mb-2 min-h-[80px] max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-gray-300">Loading code...</div>
          ) : error ? (
            <div className="p-4 text-red-400">{error}</div>
          ) : (
            <SyntaxHighlighter language={language || 'text'} style={vs2015} customStyle={{ margin: 0, padding: '1rem', borderRadius: '0.375rem', fontSize: '0.9rem', lineHeight: '1.25rem' }}>
              {code || '// No code available'}
            </SyntaxHighlighter>
          )}
        </div>
          {/* View Full Details Button */}
          
        </div>
      </div>
  );
}


