'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { usePresentationSelectors } from '../../stores/presentation-store';

interface GenerationProgressProps {
  className?: string;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ 
  className = '' 
}) => {
  const {
    isGenerating,
    progressPercentage,
    progressStep,
    generationProgress,
    isCompleted,
    isFailed,
    currentPresentation,
  } = usePresentationSelectors();

  if (!isGenerating && !isCompleted && !isFailed) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
      case 'generating_text':
      case 'generating_visuals':
      case 'generating_audio':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProgressBarColor = () => {
    if (isFailed) return 'bg-red-500';
    if (isCompleted) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${Math.round(remainingSeconds)}s`;
  };

  // Enhanced animated percentage for smoother transitions
  const [displayPercentage, setDisplayPercentage] = useState(progressPercentage);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercentage(progressPercentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const getStepMessage = () => {
    if (progressStep?.includes('text')) return 'Creating slide content and structure...';
    if (progressStep?.includes('visual')) return 'Generating beautiful visuals for your slides...';
    if (progressStep?.includes('audio')) return 'Adding professional narration...';
    if (isCompleted) return 'Your presentation is ready!';
    if (isFailed) return 'Something went wrong. Please try again.';
    return 'Initializing AI systems...';
  };

  return (
    <div className={`font-spline ${className}`}>
      <div className="max-w-[960px] mx-auto">
        {/* Main heading */}
        <h1 className="text-white text-[32px] md:text-[36px] font-bold leading-tight text-center mb-8">
          {isCompleted ? '✨ Your presentation is ready!' : 
           isFailed ? '❌ Generation failed' : 
           'Generating your narrated presentation'}
        </h1>
        
        {/* Progress section */}
        <div className="bg-[#1A1F2E]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#264532]/50">
          {/* Status message and percentage */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-white text-lg font-medium">
              {getStepMessage()}
            </p>
            {isGenerating && (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-[#38e07b] border-t-transparent rounded-full animate-spin" />
                {generationProgress?.estimatedTimeRemaining && (
                  <span className="text-[#96c5a9] text-sm">
                    ~{formatTime(generationProgress.estimatedTimeRemaining)}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Progress bar */}
          <div className="relative">
            <div className="h-3 rounded-full bg-[#264532] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#38e07b] to-[#2fd571] transition-all duration-700 ease-out relative"
                style={{ width: `${displayPercentage}%` }}
              >
                {/* Animated shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Percentage text */}
            <div className="mt-3 text-[#96c5a9] text-sm font-medium text-center">
              {displayPercentage}%
            </div>
          </div>
        </div>

        {/* Generation Steps */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <GenerationStep
            title="Generate Content"
            description="AI creating slide text and structure"
            status={getStepStatus('generating_text', generationProgress?.status)}
            icon="📝"
            stepNumber={1}
          />
          
          <GenerationStep
            title="Create Visuals"
            description="Generating images for each slide"
            status={getStepStatus('generating_visuals', generationProgress?.status)}
            icon="🎨"
            stepNumber={2}
          />
          
          <GenerationStep
            title="Add Narration"
            description="Creating voice narration for slides"
            status={getStepStatus('generating_audio', generationProgress?.status)}
            icon="🎙️"
            stepNumber={3}
          />
        </div>

        {/* Individual Slide Progress */}
        {currentPresentation && currentPresentation.slides.length > 0 && (
          <div className="mt-8 bg-[#1A1F2E]/30 rounded-2xl p-6 border border-[#264532]/30">
            <h4 className="text-white text-sm font-medium mb-4">
              Generating {currentPresentation.slides.length} slides
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {currentPresentation.slides.map((slide, index) => (
                <SlideProgress
                  key={slide.id}
                  slideNumber={index + 1}
                  title={slide.title}
                  textStatus={slide.generationStatus.text}
                  imageStatus={slide.generationStatus.image}
                  audioStatus={slide.generationStatus.audio}
                />
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {isFailed && currentPresentation?.errorMessage && (
          <div className="mt-6 p-4 bg-red-900/20 border border-red-700/30 rounded-xl">
            <p className="text-red-300 text-sm">
              <strong>Error:</strong> {currentPresentation.errorMessage}
            </p>
          </div>
        )}

        {/* Fallback Notice */}
        {currentPresentation?.metadata?.isFallback && (
          <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-xl">
            <p className="text-yellow-300 text-sm">
              <strong>Notice:</strong> This presentation was generated using fallback content due to API limitations. 
              {currentPresentation.metadata.fallbackReason && ` Reason: ${currentPresentation.metadata.fallbackReason}`}
            </p>
          </div>
        )}
        
        {/* Helper text */}
        <p className="text-[#96c5a9] text-base font-normal text-center mt-8">
          {isGenerating ? 
            'Your presentation is being created. This may take a few moments. Please do not close this window.' :
            isCompleted ? 
            'You can now view and present your slides with AI narration.' :
            'Please refresh the page and try again.'
          }
        </p>
      </div>
    </div>
  );
};

// Helper component for generation steps
interface GenerationStepProps {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  icon: string;
  stepNumber: number;
}

const GenerationStep: React.FC<GenerationStepProps> = ({ 
  title, 
  description, 
  status, 
  icon,
  stepNumber 
}) => {
  const getStepStyle = () => {
    switch (status) {
      case 'completed':
        return 'border-[#38e07b]/50 bg-[#38e07b]/10';
      case 'active':
        return 'border-[#38e07b] bg-[#264532]/50 animate-pulse';
      case 'failed':
        return 'border-red-500/50 bg-red-900/20';
      default:
        return 'border-[#264532]/30 bg-[#1A1F2E]/30 opacity-60';
    }
  };

  return (
    <div className={`relative rounded-xl border-2 p-6 transition-all duration-500 ${getStepStyle()}`}>
      {/* Step number badge */}
      <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
        status === 'completed' ? 'bg-[#38e07b] text-[#122118]' :
        status === 'active' ? 'bg-[#38e07b] text-[#122118]' :
        'bg-[#264532] text-[#96c5a9]'
      }`}>
        {stepNumber}
      </div>
      
      <div className="text-center">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
        <p className="text-[#96c5a9] text-xs">{description}</p>
        
        {/* Status indicator */}
        <div className="mt-4">
          {status === 'completed' && (
            <CheckCircleIcon className="w-5 h-5 text-[#38e07b] mx-auto" />
          )}
          {status === 'active' && (
            <div className="w-5 h-5 border-2 border-[#38e07b] border-t-transparent rounded-full animate-spin mx-auto" />
          )}
          {status === 'failed' && (
            <XCircleIcon className="w-5 h-5 text-red-400 mx-auto" />
          )}
          {status === 'pending' && (
            <div className="w-5 h-5 bg-[#264532] rounded-full mx-auto" />
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for slide progress
interface SlideProgressProps {
  slideNumber: number;
  title: string;
  textStatus: string;
  imageStatus: string;
  audioStatus: string;
}

const SlideProgress: React.FC<SlideProgressProps> = ({ 
  slideNumber, 
  title, 
  textStatus, 
  imageStatus, 
  audioStatus 
}) => {
  const getOverallStatus = () => {
    if (textStatus === 'completed' && imageStatus === 'completed' && audioStatus === 'completed') {
      return 'completed';
    }
    if (textStatus === 'failed' || imageStatus === 'failed' || audioStatus === 'failed') {
      return 'failed';
    }
    if (textStatus === 'processing' || imageStatus === 'processing' || audioStatus === 'processing') {
      return 'active';
    }
    return 'pending';
  };

  const status = getOverallStatus();
  
  return (
    <div className={`p-3 rounded-lg border text-center transition-all duration-300 ${
      status === 'completed' ? 'bg-[#38e07b]/10 border-[#38e07b]/50' :
      status === 'active' ? 'bg-[#264532]/50 border-[#38e07b] animate-pulse' :
      status === 'failed' ? 'bg-red-900/20 border-red-500/50' :
      'bg-[#1A1F2E]/30 border-[#264532]/30 opacity-60'
    }`}>
      <div className="text-white text-sm font-medium mb-1">
        Slide {slideNumber}
      </div>
      <div className="text-[#96c5a9] text-xs mb-2 truncate" title={title}>
        {title}
      </div>
      <div className="flex justify-center space-x-1">
        <StatusDot status={textStatus} title="Text" />
        <StatusDot status={imageStatus} title="Image" />
        <StatusDot status={audioStatus} title="Audio" />
      </div>
    </div>
  );
};

// Helper components
const StatusIndicator: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    case 'active':
      return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    case 'failed':
      return <XCircleIcon className="w-4 h-4 text-red-500" />;
    default:
      return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
  }
};

const StatusDot: React.FC<{ status: string; title: string }> = ({ status, title }) => {
  const getColor = () => {
    switch (status) {
      case 'completed': return 'bg-[#38e07b]';
      case 'processing': return 'bg-[#38e07b] animate-pulse';
      case 'failed': return 'bg-red-400';
      default: return 'bg-[#264532]';
    }
  };

  return (
    <div 
      className={`w-2 h-2 rounded-full ${getColor()}`}
      title={`${title}: ${status}`}
    />
  );
};

// Helper function to determine step status
function getStepStatus(stepName: string, currentStatus?: string): 'pending' | 'active' | 'completed' | 'failed' {
  if (!currentStatus) return 'pending';
  
  const statusOrder = ['pending', 'processing', 'generating_text', 'generating_visuals', 'generating_audio', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepName);
  
  if (currentStatus === 'failed') return 'failed';
  if (currentIndex > stepIndex) return 'completed';
  if (currentIndex === stepIndex) return 'active';
  return 'pending';
}
