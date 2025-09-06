'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '../src/components/ui/Header';
import { LandingHero } from '../src/components/ui/LandingHero';
import { GenerationProgress } from '../src/components/generation/GenerationProgress';
import { PresentationViewer } from '../src/components/presentation/PresentationViewer';
import { useCreatePresentation, usePresentationTracking } from '../src/hooks/use-presentation';
import { usePresentationSelectors } from '../src/stores/presentation-store';

export default function HomePage() {
  const router = useRouter();
  const [didRedirect, setDidRedirect] = useState(false);
  const { createPresentation, isLoading, error } = useCreatePresentation();
  
  const {
    currentPresentation,
    isGenerating,
    isCompleted,
    isFailed,
    reset,
  } = usePresentationSelectors();

  // Track presentation progress
  usePresentationTracking(currentPresentation?.id || null);

  // Redirect to edit screen when generation finishes
  useEffect(() => {
    if (!currentPresentation?.id) return;
    if ((isCompleted || isFailed) && !didRedirect) {
      router.push(`/presentations/${currentPresentation.id}/edit`);
      setDidRedirect(true);
    }
  }, [currentPresentation?.id, isCompleted, isFailed, didRedirect, router]);

  const handleTopicSubmit = async (topic: string) => {
    const presentation = await createPresentation(topic);
    // For App Router, we don't redirect immediately but show the progress
  };

  const handleStartOver = () => {
    reset();
  };

  // Show different UI based on state
  const showTopicForm = !currentPresentation && !isGenerating;
  const showProgress = isGenerating && !isCompleted && !isFailed;
  const showViewer = currentPresentation && (isCompleted || isFailed);

  return (
    <div className="flex flex-col min-h-screen text-white relative overflow-hidden bg-[#122118]">
      {/* Header */}
      <Header 
        variant="solid"
      />

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-stretch justify-start text-center">
        {error && (
          <div className="px-10 md:px-20 lg:px-40 mt-6">
            <div className="rounded-xl border border-red-900/30 bg-red-900/10 p-4 text-left">
              <p className="text-red-300 text-sm">
                <strong className="mr-1">Error:</strong> {error}
              </p>
            </div>
          </div>
        )}

        {/* Landing Page - Stitch-inspired hero */}
        {showTopicForm && (
          <LandingHero onSubmit={handleTopicSubmit} isLoading={isLoading} />
        )}

        {/* Generation Progress */}
        {showProgress && (
          <GenerationProgress className="px-10 md:px-20 lg:px-40 py-5 animate-in fade-in slide-in-from-bottom-6 duration-800" />
        )}

        {/* Presentation Editor (redirect handled above) */}
        {showViewer && currentPresentation && (
          <div className="w-full max-w-7xl mx-auto px-4 text-[#96c5a9] py-10">
            Redirecting to editor...
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 mb-8 px-10 md:px-20 lg:px-40">
        <div className="text-center text-xs text-[#96c5a9]">
          © 2024 SpeakDeck • Powered by AI
        </div>
      </footer>
    </div>
  );
}
