import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { validatePresentationTitle } from '@speakdeck/shared';

interface TopicFormProps {
  onSubmit: (topic: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const TopicForm: React.FC<TopicFormProps> = ({ 
  onSubmit, 
  isLoading = false,
  className = '' 
}) => {
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePresentationTitle(topic);
    if (!validation.isValid) {
      setError(validation.error!);
      return;
    }

    setError(null);
    onSubmit(topic);
  };

  const sampleTopics = [
    'The Future of Artificial Intelligence',
    'Climate Change Solutions',
    'Startup Business Strategy',
    'Digital Marketing Trends',
    'Remote Work Best Practices',
    'Cryptocurrency and Blockchain',
    'Space Exploration Updates',
    'Healthy Living Tips',
  ];

  const handleSampleClick = (sampleTopic: string) => {
    setTopic(sampleTopic);
    setError(null);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-8 ${className}`}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create Your Presentation
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter any topic and our AI will create a complete presentation with visuals and narration in under 60 seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to present about?
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g., The Future of Space Travel, Marketing Strategy, Climate Change..."
              className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
              maxLength={100}
            />
            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
            <p className="text-gray-500 text-sm mt-2">
              {topic.length}/100 characters
            </p>
          </div>
          
          <div className="md:self-end">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className={`flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-lg transition-all ${
                isLoading || !topic.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Generate Presentation
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sample Topics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Or try one of these sample topics:
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleTopics.map((sampleTopic) => (
            <button
              key={sampleTopic}
              onClick={() => handleSampleClick(sampleTopic)}
              disabled={isLoading}
              className={`text-left p-3 rounded-lg border transition-colors ${
                isLoading
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700'
              }`}
            >
              <span className="text-sm font-medium">{sampleTopic}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🤖</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">AI-Generated Content</h4>
            <p className="text-sm text-gray-600">
              Smart content creation with compelling text and structure
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🎨</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Dynamic Visuals</h4>
            <p className="text-sm text-gray-600">
              Beautiful, relevant images generated for each slide
            </p>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl">🎙️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Voice Narration</h4>
            <p className="text-sm text-gray-600">
              Professional voice narration for every slide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
