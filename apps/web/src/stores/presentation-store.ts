import { create } from 'zustand';
import { Presentation, PresentationProgress } from '@speakdeck/shared';

interface PresentationState {
  // Current presentation
  currentPresentation: Presentation | null;
  
  // Generation progress
  generationProgress: PresentationProgress | null;
  
  // UI state
  isGenerating: boolean;
  currentSlideIndex: number;
  isPlaying: boolean;
  volume: number;
  
  // Error handling
  error: string | null;
  
  // Actions
  setCurrentPresentation: (presentation: Presentation | null) => void;
  setGenerationProgress: (progress: PresentationProgress | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setCurrentSlideIndex: (index: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setError: (error: string | null) => void;
  
  // Navigation actions
  nextSlide: () => void;
  previousSlide: () => void;
  goToSlide: (index: number) => void;
  
  // Playback actions
  togglePlayback: () => void;
  
  // Reset actions
  reset: () => void;
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  // Initial state
  currentPresentation: null,
  generationProgress: null,
  isGenerating: false,
  currentSlideIndex: 0,
  isPlaying: false,
  volume: 0.8,
  error: null,
  
  // Basic setters
  setCurrentPresentation: (presentation) => 
    set({ 
      currentPresentation: presentation,
      currentSlideIndex: 0,
      isPlaying: false,
      error: null,
    }),
  
  setGenerationProgress: (progress) => 
    set({ generationProgress: progress }),
  
  setIsGenerating: (isGenerating) => 
    set({ isGenerating }),
  
  setCurrentSlideIndex: (index) => {
    const { currentPresentation } = get();
    if (currentPresentation && index >= 0 && index < currentPresentation.slides.length) {
      set({ currentSlideIndex: index, isPlaying: false });
    }
  },
  
  setIsPlaying: (isPlaying) => 
    set({ isPlaying }),
  
  setVolume: (volume) => 
    set({ volume: Math.max(0, Math.min(1, volume)) }),
  
  setError: (error) => 
    set({ error }),
  
  // Navigation actions
  nextSlide: () => {
    const { currentPresentation, currentSlideIndex } = get();
    if (currentPresentation && currentSlideIndex < currentPresentation.slides.length - 1) {
      set({ 
        currentSlideIndex: currentSlideIndex + 1,
        isPlaying: false,
      });
    }
  },
  
  previousSlide: () => {
    const { currentSlideIndex } = get();
    if (currentSlideIndex > 0) {
      set({ 
        currentSlideIndex: currentSlideIndex - 1,
        isPlaying: false,
      });
    }
  },
  
  goToSlide: (index) => {
    const { currentPresentation } = get();
    if (currentPresentation && index >= 0 && index < currentPresentation.slides.length) {
      set({ 
        currentSlideIndex: index,
        isPlaying: false,
      });
    }
  },
  
  // Playback actions
  togglePlayback: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },
  
  // Reset actions
  reset: () => 
    set({
      currentPresentation: null,
      generationProgress: null,
      isGenerating: false,
      currentSlideIndex: 0,
      isPlaying: false,
      volume: 0.8,
      error: null,
    }),
}));

// Selectors for commonly used computed values
export const usePresentationSelectors = () => {
  const store = usePresentationStore();
  
  return {
    ...store,
    
    // Current slide
    currentSlide: store.currentPresentation?.slides[store.currentSlideIndex] || null,
    
    // Navigation state
    canGoNext: store.currentPresentation 
      ? store.currentSlideIndex < store.currentPresentation.slides.length - 1
      : false,
    
    canGoPrevious: store.currentSlideIndex > 0,
    
    // Progress state
    isCompleted: store.currentPresentation?.status === 'completed',
    isFailed: store.currentPresentation?.status === 'failed',
    
    // Slide counts
    totalSlides: store.currentPresentation?.slides.length || 0,
    currentSlideNumber: store.currentSlideIndex + 1,
    
    // Generation state
    progressPercentage: store.generationProgress?.progress || 0,
    progressStep: store.generationProgress?.currentStep || '',
    
    // Audio state for current slide
    hasAudio: (store.currentPresentation?.slides[store.currentSlideIndex]?.audioUrl?.length ?? 0) > 0,
    audioUrl: store.currentPresentation?.slides[store.currentSlideIndex]?.audioUrl || null,
  };
};
