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
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Cahier des charges
          </h2>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-8 overflow-y-auto max-h-[70vh]">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown>{specifications}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
} 