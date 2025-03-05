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
      <div className="mb-8">
        {/* Carrousel principal */}
        <div className="relative h-[400px] mb-4 rounded-lg overflow-hidden">
          <Image
            src={images[selectedImage ?? 0].url}
            alt={images[selectedImage ?? 0].caption || 'Image du projet'}
            fill
            className="object-contain"
          />
          
          {/* Boutons de navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                ←
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                →
              </button>
            </>
          )}

          {/* Bouton plein écran */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-7 11h4m-4 0v4m0-4l5 5m11-5h-4m4 0v4m0-4l-5 5" />
            </svg>
          </button>
        </div>

        {/* Miniatures */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden ${
                selectedImage === index ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <Image
                src={image.url}
                alt={image.caption || `Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Modal plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative w-full h-full">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/70"
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full hover:bg-black/70"
                >
                  →
                </button>
              </>
            )}
          </div>

          {images[selectedImage ?? 0].caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded">
              {images[selectedImage ?? 0].caption}
            </div>
          )}
        </div>
      )}
    </>
  );
} 