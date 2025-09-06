'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPresentation } from '../../../../src/hooks/use-presentation';
import { Header } from '../../../../src/components/ui/Header';
import { usePresentationSelectors, usePresentationStore } from '../../../../src/stores/presentation-store';

export default function PresentationViewPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const id = params?.id ?? null;
  const { presentation, isLoading, error } = useGetPresentation(id ?? null);
  const { currentPresentation, currentSlide, currentSlideNumber, totalSlides, canGoNext, canGoPrevious } = usePresentationSelectors();
  const nextSlide = usePresentationStore(s => s.nextSlide);
  const previousSlide = usePresentationStore(s => s.previousSlide);

  const heroImage = currentSlide?.imageUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  return (
    <div className="min-h-screen bg-[#122118] text-white font-spline">
      <Header variant="solid" />
      
      {/* Presentation Controls Bar */}
      <div className="px-10 md:px-20 lg:px-40 py-4 border-b border-[#366348]/30">
        <div className="flex items-center justify-between max-w-[960px] mx-auto">
          <div>
            <h1 className="text-xl font-bold text-white">
              {currentPresentation?.title || 'Loading...'}
            </h1>
            <p className="text-[#96c5a9] text-sm">
              Presentation Mode
            </p>
          </div>
          <button
            onClick={() => router.push(`/presentations/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#264532] hover:bg-[#2f5139] text-white rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"/>
            </svg>
            Edit
          </button>
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          {/* Presentation Slide Display */}
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden aspect-video">
            {/* Slide Image Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            />
            
            {/* Slide Content Overlay */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 bg-black/20">
              {currentSlide && (
                <div className="text-center max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                    {currentSlide.title}
                  </h1>
                  <p className="text-lg md:text-2xl text-white/90 leading-relaxed drop-shadow-md">
                    {currentSlide.content}
                  </p>
                </div>
              )}
            </div>
            
            {/* Slide Progress Indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm font-medium">
                  Slide {(currentSlideNumber || 1)} of {totalSlides || 1}
                </span>
                <span className="text-white/80 text-sm">
                  {currentSlide?.title || 'Loading...'}
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-1">
                <div 
                  className="bg-white rounded-full h-1 transition-all duration-300 ease-out"
                  style={{ width: `${((currentSlideNumber || 1) / (totalSlides || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Presentation Controls */}
          <div className="flex justify-center items-center mt-6">
            <div className="flex items-center gap-4 px-6 py-4 bg-[#1b3124] rounded-2xl border border-[#366348]">
              <button
                onClick={previousSlide}
                disabled={!canGoPrevious}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#264532] text-white hover:bg-[#2f5139] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
                </svg>
              </button>
              
              <div className="text-center min-w-[120px]">
                <div className="text-white font-semibold text-lg">
                  {currentSlideNumber || 1} / {totalSlides || 1}
                </div>
                <div className="text-[#96c5a9] text-sm">
                  {currentSlide?.title || 'Loading...'}
                </div>
              </div>
              
              <button
                onClick={nextSlide}
                disabled={!canGoNext}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[#38e07b] text-[#122118] hover:bg-[#2fce6b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next slide"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

