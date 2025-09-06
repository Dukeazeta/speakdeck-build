'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPresentation } from '../../../../src/hooks/use-presentation';
import { usePresentationSelectors, usePresentationStore } from '../../../../src/stores/presentation-store';
import { EditorHeader } from '../../../../src/components/presentation/EditorHeader';

export default function PresentationEditorPage() {
  const params = useParams() as { id?: string };
  const id = params?.id ?? null;
  const { presentation, isLoading, error } = useGetPresentation(id ?? null);
  const { currentPresentation, currentSlide, currentSlideNumber, totalSlides } = usePresentationSelectors();
  const setCurrentPresentation = usePresentationStore(s => s.setCurrentPresentation);

  const [slideText, setSlideText] = useState('');
  const [narrationText, setNarrationText] = useState('');

  React.useEffect(() => {
    if (currentSlide) {
      setSlideText(currentSlide.content || '');
      // narration is not part of the model; keep separate client state
      setNarrationText((prev) => prev || '');
    }
  }, [currentSlide?.id]);

  const heroImage = currentSlide?.imageUrl || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop';

  const router = useRouter();

  const handleSave = () => {
    if (!currentPresentation || !currentSlide) return;
    const updated = {
      ...currentPresentation,
      slides: currentPresentation.slides.map(s => s.id === currentSlide.id ? { ...s, content: slideText } : s)
    };
    setCurrentPresentation(updated);
  };

  // Present button now handles navigation to view

  return (
    <div className="min-h-screen bg-[#122118] text-white font-spline">
      <EditorHeader />

      <div className="gap-1 px-6 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[920px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="tracking-light text-[28px] md:text-[32px] font-bold leading-tight min-w-72">
              {currentPresentation ? `Presentation Title: ${currentPresentation.title}` : 'Loading Presentation...'}
            </p>
            <p className="text-[#96c5a9] text-sm">Slide {currentSlideNumber} of {totalSlides}</p>
          </div>
          <div className="p-4">
            <div className="relative flex items-center justify-center bg-cover bg-center aspect-video rounded-xl p-4" style={{ backgroundImage: `url(${heroImage})` }}>
              <button className="flex shrink-0 items-center justify-center rounded-full size-16 bg-black/40 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path></svg>
              </button>
            </div>
          </div>

          {/* Editors */}
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-base font-medium pb-2">Slide Text</p>
              <textarea
                value={slideText}
                onChange={(e) => setSlideText(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#366348] bg-[#1b3124] focus:border-[#366348] min-h-36 placeholder:text-[#96c5a9] p-[15px] text-base leading-normal"
                placeholder="Edit the slide content here"
              />
            </label>
          </div>
          <div className="flex max-w-[640px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <p className="text-base font-medium pb-2">Narration Text</p>
              <textarea
                value={narrationText}
                onChange={(e) => setNarrationText(e.target.value)}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border border-[#366348] bg-[#1b3124] focus:border-[#366348] min-h-36 placeholder:text-[#96c5a9] p-[15px] text-base leading-normal"
                placeholder="Edit the voiceover narration here"
              />
            </label>
          </div>

          <div className="flex justify-stretch">
            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
              <button onClick={handleSave} className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#264532] text-white text-sm font-bold tracking-[0.015em]">
                <span className="truncate">Save</span>
              </button>
              <button 
                onClick={() => id && router.push(`/presentations/${id}/view`)}
                className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#38e07b] text-[#122118] text-base font-bold tracking-[0.015em] hover:bg-[#2fce6b] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="mr-2">
                  <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path>
                </svg>
                <span className="truncate">Present</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slides Sidebar */}
        <div className="layout-content-container flex flex-col w-[360px]">
          <h2 className="text-[22px] font-bold tracking-[-0.015em] px-4 pb-3 pt-5">Slides</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
            {currentPresentation?.slides.map((s) => (
              <div key={s.id} className="flex flex-col gap-3">
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: `url(${s.imageUrl || heroImage})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

