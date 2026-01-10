"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

export default function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToPrevious = useCallback(() => {
    if (images.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [images.length, isAnimating]);

  const goToNext = useCallback(() => {
    if (images.length === 0 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 500);
  }, [images.length, isAnimating]);

  const goToIndex = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [currentIndex, isAnimating]);

  if (images.length === 0) {
    return (
      <div className={`relative ${className}`}>
        <div className="aspect-3/4 bg-gray-200 rounded-lg shadow-2xl flex items-center justify-center">
          <p className="text-gray-500 text-center px-4">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Preload all images - hidden but loaded */}
      <div className="hidden">
        {images.map((src, index) => (
          <Image
            key={`preload-${index}`}
            src={src}
            alt=""
            width={1}
            height={1}
            priority
          />
        ))}
      </div>

      {/* Image Container */}
      <div className="aspect-3/4 relative overflow-hidden rounded-lg shadow-2xl transform rotate-2">
        {/* Current Image with fade animation */}
        <div
          key={currentIndex}
          className="absolute inset-0 animate-fade-in"
        >
          <Image
            src={images[currentIndex]}
            alt={`Photo ${currentIndex + 1}`}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            disabled={isAnimating}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-white disabled:opacity-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full cursor-pointer bg-black/30 backdrop-blur-sm shadow-lg"
            aria-label="Previous image"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            disabled={isAnimating}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-white disabled:opacity-50 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full cursor-pointer bg-black/30 backdrop-blur-sm shadow-lg"
            aria-label="Next image"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              disabled={isAnimating}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute -bottom-4 -left-4 text-4xl">❦</div>
      <div className="absolute -top-4 -right-4 text-4xl transform rotate-180">❦</div>
    </div>
  );
}
