"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  className?: string;
}

// Minimum horizontal distance (px) for a touch gesture to count as a swipe.
const SWIPE_THRESHOLD = 50;

export default function ImageCarousel({ images, className = "" }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;

      const deltaX = e.changedTouches[0].clientX - touchStartX.current;
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;

      // Only treat as a swipe when the gesture is mostly horizontal,
      // so vertical scrolling of the page isn't hijacked.
      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (deltaX < 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
    },
    [goToNext, goToPrevious]
  );

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
      {/* Image Container */}
      <div
        className="aspect-3/4 relative overflow-hidden rounded-lg shadow-2xl transform rotate-2 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/*
          All images stay mounted and stacked on top of each other; we only
          crossfade opacity between them. Keeping every slide in the DOM means
          the browser decodes each image once and never has to re-mount or
          re-fetch when switching, which eliminates the flicker on mobile.
        */}
        {images.map((src, index) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-500 ease-out"
            style={{ opacity: index === currentIndex ? 1 : 0 }}
            aria-hidden={index === currentIndex ? undefined : true}
          >
            <Image
              src={src}
              alt={`Photo ${index + 1}`}
              fill
              priority={index === 0}
              unoptimized
              draggable={false}
              className="object-cover select-none"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full cursor-pointer bg-black/30 backdrop-blur-sm shadow-lg"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-white hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full cursor-pointer bg-black/30 backdrop-blur-sm shadow-lg"
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
