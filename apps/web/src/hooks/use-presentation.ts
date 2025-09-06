import { useState, useEffect, useCallback } from 'react';
import { Presentation, PresentationProgress, ApiResponse } from '@speakdeck/shared';
import { usePresentationStore } from '../stores/presentation-store';
import { supabase } from '../lib/supabase';

export function useCreatePresentation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setCurrentPresentation, setIsGenerating } = usePresentationStore();

  const createPresentation = useCallback(async (title: string): Promise<Presentation | null> => {
    setIsLoading(true);
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      const result: ApiResponse<Presentation> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create presentation');
      }

      setCurrentPresentation(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsGenerating(false);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentPresentation, setIsGenerating]);

  return {
    createPresentation,
    isLoading,
    error,
  };
}

export function useGetPresentation(id: string | null) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentPresentation } = usePresentationStore();

  const fetchPresentation = useCallback(async (presentationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/presentations/${presentationId}`);
      const result: ApiResponse<Presentation> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch presentation');
      }

      setPresentation(result.data);
      setCurrentPresentation(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setCurrentPresentation]);

  useEffect(() => {
    if (id) {
      fetchPresentation(id);
    }
  }, [id, fetchPresentation]);

  return {
    presentation,
    isLoading,
    error,
    refetch: id ? () => fetchPresentation(id) : undefined,
  };
}

export function usePresentationProgress(presentationId: string | null) {
  const [progress, setProgress] = useState<PresentationProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setGenerationProgress, setIsGenerating, setCurrentPresentation } = usePresentationStore();

  // Fetch full presentation data when completed
  const fetchCompletedPresentation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}`);
      const result: ApiResponse<Presentation> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch presentation');
      }

      console.log('Fetched completed presentation:', result.data);
      setCurrentPresentation(result.data);
      return result.data;
    } catch (err) {
      console.error('Failed to fetch completed presentation:', err);
      return null;
    }
  }, [setCurrentPresentation]);

  // Polling for status updates
  const fetchStatus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}/status`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch status');
      }

      const progressData: PresentationProgress = {
        presentationId: id,
        status: result.data.status,
        progress: result.data.progress,
        currentStep: result.data.currentStep,
        estimatedTimeRemaining: result.data.estimatedTimeRemaining,
      };

      setProgress(progressData);
      setGenerationProgress(progressData);

      // Update generation state based on status
      const isStillGenerating = ['pending', 'processing', 'generating_text', 'generating_visuals', 'generating_audio'].includes(result.data.status);
      setIsGenerating(isStillGenerating);

      // If generation completed, fetch the full presentation data
      if (!isStillGenerating && (result.data.status === 'completed' || result.data.status === 'failed')) {
        await fetchCompletedPresentation(id);
      }

      return progressData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    }
  }, [setGenerationProgress, setIsGenerating, fetchCompletedPresentation]);

  // Set up polling
  useEffect(() => {
    if (!presentationId) return;

    setIsLoading(true);
    
    const pollStatus = async () => {
      const progressData = await fetchStatus(presentationId);
      
      // Continue polling if still generating
      if (progressData && ['pending', 'processing', 'generating_text', 'generating_visuals', 'generating_audio'].includes(progressData.status)) {
        setTimeout(pollStatus, 2000); // Poll every 2 seconds
      } else {
        setIsLoading(false);
      }
    };

    pollStatus();
  }, [presentationId, fetchStatus]);

  return {
    progress,
    isLoading,
    error,
  };
}

export function useRealtimeProgress(presentationId: string | null) {
  const { setGenerationProgress, setIsGenerating, setCurrentPresentation } = usePresentationStore();

  // Fetch full presentation data when completed
  const fetchCompletedPresentation = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/presentations/${id}`);
      const result: ApiResponse<Presentation> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch presentation');
      }

      console.log('Fetched completed presentation via realtime:', result.data);
      setCurrentPresentation(result.data);
      return result.data;
    } catch (err) {
      console.error('Failed to fetch completed presentation via realtime:', err);
      return null;
    }
  }, [setCurrentPresentation]);

  useEffect(() => {
    if (!presentationId) return;

    const channel = supabase.channel(`presentation-${presentationId}`)
      .on('broadcast', { event: 'progress_update' }, async (payload) => {
        const progressData: PresentationProgress = {
          presentationId: payload.payload.presentationId,
          status: payload.payload.status,
          progress: payload.payload.progress,
          currentStep: payload.payload.currentStep,
        };

        setGenerationProgress(progressData);

        // Update generation state
        const isStillGenerating = ['pending', 'processing', 'generating_text', 'generating_visuals', 'generating_audio'].includes(progressData.status);
        setIsGenerating(isStillGenerating);

        // If generation completed, fetch the full presentation data
        if (!isStillGenerating && (progressData.status === 'completed' || progressData.status === 'failed')) {
          await fetchCompletedPresentation(presentationId);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [presentationId, setGenerationProgress, setIsGenerating, fetchCompletedPresentation]);
}

// Combined hook that handles both polling and real-time updates
export function usePresentationTracking(presentationId: string | null) {
  // Use both polling and real-time updates
  const polling = usePresentationProgress(presentationId);
  useRealtimeProgress(presentationId);

  return polling;
}
