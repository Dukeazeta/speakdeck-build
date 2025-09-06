import React from 'react';
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

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {isCompleted ? 'Generation Complete!' : 
           isFailed ? 'Generation Failed' : 
           'Generating Presentation...'}
        </h3>
        
        {isCompleted && (
          <CheckCircleIcon className="w-6 h-6 text-green-500" />
        )}
        
        {isFailed && (
          <XCircleIcon className="w-6 h-6 text-red-500" />
        )}

        {isGenerating && (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">
              {generationProgress?.estimatedTimeRemaining && 
                `~${formatTime(generationProgress.estimatedTimeRemaining)} remaining`
              }
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className={getStatusColor(generationProgress?.status || '')}>
            {progressStep || 'Initializing...'}
          </span>
          <span className="font-medium">
            {progressPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Generation Steps */}
      <div className="space-y-3">
        <GenerationStep
          title="Generate Content"
          description="AI creating slide text and structure"
          status={getStepStatus('generating_text', generationProgress?.status)}
          icon="📝"
        />
        
        <GenerationStep
          title="Create Visuals"
          description="Generating images for each slide"
          status={getStepStatus('generating_visuals', generationProgress?.status)}
          icon="🎨"
        />
        
        <GenerationStep
          title="Add Narration"
          description="Creating voice narration for slides"
          status={getStepStatus('generating_audio', generationProgress?.status)}
          icon="🎙️"
        />
      </div>

      {/* Individual Slide Progress */}
      {currentPresentation && currentPresentation.slides.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Slide Progress ({currentPresentation.slides.length} slides)
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
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {currentPresentation.errorMessage}
          </p>
        </div>
      )}

      {/* Fallback Notice */}
      {currentPresentation?.metadata?.isFallback && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Notice:</strong> This presentation was generated using fallback content due to API limitations. 
            {currentPresentation.metadata.fallbackReason && ` Reason: ${currentPresentation.metadata.fallbackReason}`}
          </p>
        </div>
      )}
    </div>
  );
};

// Helper component for generation steps
interface GenerationStepProps {
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  icon: string;
}

const GenerationStep: React.FC<GenerationStepProps> = ({ 
  title, 
  description, 
  status, 
  icon 
}) => {
  const getStepStyle = () => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'active':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'failed':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center p-3 rounded-md border ${getStepStyle()}`}>
      <div className="text-lg mr-3">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium text-sm">{title}</p>
          <StatusIndicator status={status} />
        </div>
        <p className="text-xs opacity-75">{description}</p>
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
    <div className={`p-2 rounded border text-center ${
      status === 'completed' ? 'bg-green-50 border-green-200' :
      status === 'active' ? 'bg-blue-50 border-blue-200' :
      status === 'failed' ? 'bg-red-50 border-red-200' :
      'bg-gray-50 border-gray-200'
    }`}>
      <div className="text-sm font-medium mb-1">
        Slide {slideNumber}
      </div>
      <div className="text-xs text-gray-600 mb-2 truncate" title={title}>
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
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500 animate-pulse';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-300';
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
