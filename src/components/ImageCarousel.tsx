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
  // Index that was active before the current one. We keep it fully opaque
  // beneath the incoming image during the crossfade so there is never a
  // transparent gap (which is what flashes/flickers on mobile GPUs).
  const [prevIndex, setPrevIndex] = useState(0);
  // Indices whose <img> has fully loaded (and is therefore decoded and safe to
  // fade in). Revealing an image before it is decoded paints one blank/partial
  // frame on top of the stack, which is the flicker seen on images that hadn't
  // finished loading yet (e.g. the 3rd and last slides).
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set());

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleLoaded = useCallback((index: number) => {
    setLoaded((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const changeIndex = useCallback((next: number) => {
    setCurrentIndex((current) => {
      if (next === current) return current;
      setPrevIndex(current);
      return next;
    });
  }, []);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    changeIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [images.length, currentIndex, changeIndex]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    changeIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [images.length, currentIndex, changeIndex]);

  const goToIndex = useCallback((index: number) => {
    changeIndex(index);
  }, [changeIndex]);

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
        style={{ isolation: "isolate" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/*
          All images stay mounted and stacked on top of each other. We crossfade
          by fading the incoming image (top of the stack) up from 0 while the
          previous image stays fully opaque directly beneath it. Because there is
          always an opaque image behind the one that's fading, the background is
          never visible through the stack, which is what eliminates the flicker
          on mobile. Each layer is promoted to its own GPU compositing layer to
          avoid repaint flashes during the transition.
        */}
        {images.map((src, index) => {
          const isCurrent = index === currentIndex;
          const isPrev = index === prevIndex;
          const isLoaded = loaded.has(index);
          // The incoming image is only revealed once it has finished loading
          // (and therefore decoded), so we never paint an undecoded frame.
          // Until then the previous image stays opaque underneath as a backdrop.
          const showCurrent = isCurrent && isLoaded;
          // Hold the previous image until the incoming one is actually visible.
          const showPrev = isPrev && !showCurrent;
          // Active image on top, the outgoing one just beneath it, rest hidden.
          const zIndex = isCurrent ? 2 : isPrev ? 1 : 0;
          const opacity = showCurrent || showPrev ? 1 : 0;

          return (
            <div
              key={src}
              className="absolute inset-0 transition-opacity duration-500 ease-out"
              style={{
                opacity,
                zIndex,
                willChange: "opacity",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
              aria-hidden={isCurrent ? undefined : true}
            >
              <Image
                src={src}
                alt={`Photo ${index + 1}`}
                fill
                priority={index === 0}
                loading={index === 0 ? undefined : "eager"}
                draggable={false}
                onLoad={() => handleLoaded(index)}
                className="object-cover select-none"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          );
        })}
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
