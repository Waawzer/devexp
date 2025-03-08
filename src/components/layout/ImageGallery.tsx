"use client";

import { useState } from 'react';
import Image from 'next/image';

interface ProjectImage {
  url: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: ProjectImage[];
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!images || images.length === 0) return null;

  const handlePrevious = () => {
    setSelectedImage(current => 
      current === null || current === 0 ? images.length - 1 : current - 1
    );
  };

  const handleNext = () => {
    setSelectedImage(current => 
      current === null || current === images.length - 1 ? 0 : current + 1
    );
  };

  return (
    <>
      <div className="mb-8 space-y-4">
        {/* Image principale */}
        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg 
                    group bg-gray-900">
          <Image
            src={images[selectedImage ?? 0].url}
            alt={images[selectedImage ?? 0].caption || 'Image du projet'}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Boutons de navigation */}
          {images.length > 1 && (
            <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 
                        group-hover:opacity-100 transition-opacity">
              <button
                onClick={handlePrevious}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 
                       transform transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 
                       transform transition-all duration-200 hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Bouton plein écran */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white 
                   hover:bg-black/70 opacity-0 group-hover:opacity-100 transition-all 
                   duration-200 hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m11-5h-4m4 0v4m0-4l-5 5" />
            </svg>
          </button>

          {/* Légende */}
          {images[selectedImage ?? 0].caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 
                        bg-black/50 text-white rounded-full text-sm backdrop-blur-sm">
              {images[selectedImage ?? 0].caption}
            </div>
          )}
        </div>

        {/* Miniatures */}
        <div className="flex gap-3 overflow-x-auto pb-2 px-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative flex-shrink-0 group/thumb ${
                selectedImage === index 
                  ? 'ring-2 ring-blue-500 ring-offset-2' 
                  : 'hover:ring-2 hover:ring-blue-300 hover:ring-offset-2'
              }`}
            >
              <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                <Image
                  src={image.url}
                  alt={image.caption || `Image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-200 
                         group-hover/thumb:scale-110"
                />
                <div className={`absolute inset-0 bg-black/20 transition-opacity 
                              ${selectedImage === index ? 'opacity-0' : 'group-hover/thumb:opacity-0'}`} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm">
          <div className="absolute top-4 right-4 z-10 space-x-2">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 
                     transition-colors backdrop-blur-sm"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="relative h-full flex items-center justify-center">
            <Image
              src={images[selectedImage ?? 0].url}
              alt={images[selectedImage ?? 0].caption || 'Image du projet'}
              fill
              className="object-contain"
            />
            
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 p-4 rounded-full bg-white/10 text-white 
                         hover:bg-white/20 transition-all duration-200 hover:scale-110 
                         backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 p-4 rounded-full bg-white/10 text-white 
                         hover:bg-white/20 transition-all duration-200 hover:scale-110 
                         backdrop-blur-sm"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {images[selectedImage ?? 0].caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 
                        bg-white/10 text-white rounded-full backdrop-blur-sm">
              {images[selectedImage ?? 0].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
} 