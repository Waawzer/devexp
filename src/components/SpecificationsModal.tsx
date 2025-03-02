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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Cahier des charges</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ✕
          </button>
        </div>
        
        <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-800 prose-li:text-gray-600">
          <ReactMarkdown>{specifications}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
} 