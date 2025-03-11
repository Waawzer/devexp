import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface SpecificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  specifications: string;
}

export default function SpecificationsModal({ isOpen, onClose, specifications }: SpecificationsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-2xl overflow-hidden border border-gray-700">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 sticky top-0 z-10 flex justify-between items-center border-b border-gray-700">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400 flex items-center gap-3">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cahier des charges
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-indigo-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[70vh] bg-gray-800">
          <article className="prose prose-lg max-w-none prose-invert prose-headings:text-gray-100 prose-p:text-gray-300 prose-a:text-indigo-400 hover:prose-a:text-indigo-300 prose-strong:text-gray-100 prose-code:text-gray-100 prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-700">
            <ReactMarkdown>{specifications}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
} 