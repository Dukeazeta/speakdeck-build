'use client';

import React from 'react';
import { TopicForm } from '../src/components/ui/TopicForm';
import { GenerationProgress } from '../src/components/generation/GenerationProgress';
import { PresentationViewer } from '../src/components/presentation/PresentationViewer';
import { useCreatePresentation, usePresentationTracking } from '../src/hooks/use-presentation';
import { usePresentationSelectors } from '../src/stores/presentation-store';

export default function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">SpeakDeck</h1>
            </div>
            
            {currentPresentation && (
              <button
                onClick={handleStartOver}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Start New Presentation
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Topic Form or Progress */}
          <div className="space-y-6">
            {showTopicForm && (
              <TopicForm 
                onSubmit={handleTopicSubmit}
                isLoading={isLoading}
              />
            )}

            {showProgress && (
              <GenerationProgress />
            )}

            {showViewer && currentPresentation && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentPresentation.title}
                  </h2>
                  {currentPresentation.metadata?.isFallback && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Fallback Content
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Status: <span className="font-medium capitalize">{currentPresentation.status}</span></p>
                  <p>Slides: <span className="font-medium">{currentPresentation.totalSlides}</span></p>
                  {currentPresentation.generationTimeMs && (
                    <p>Generated in: <span className="font-medium">
                      {(currentPresentation.generationTimeMs / 1000).toFixed(1)}s
                    </span></p>
                  )}
                  <p>Created: <span className="font-medium">
                    {currentPresentation.createdAt.toLocaleString()}
                  </span></p>
                </div>

                {isCompleted && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      ✅ Your presentation is ready! Use the navigation controls to explore your slides and play the narration.
                    </p>
                  </div>
                )}

                {isFailed && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-700">
                      ❌ Generation failed. Please try again with a different topic.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Presentation Viewer */}
          <div>
            {showViewer && (
              <PresentationViewer />
            )}

            {!showViewer && (
              <div className="bg-white/60 rounded-xl p-8 text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">🎤</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Slides That Speak
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your presentation will appear here once generation is complete. 
                    Navigate through slides and enjoy AI-powered narration.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-gray-500">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>AI-generated content and structure</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Custom visuals for each slide</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                    <span>Professional voice narration</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/50 border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Powered by AI • Built with Next.js, Supabase, and modern web technologies
            </p>
            <p className="text-gray-500 text-xs mt-2">
              SpeakDeck Demo - Turn any topic into engaging, narrated presentations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
