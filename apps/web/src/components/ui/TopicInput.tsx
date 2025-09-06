'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function TopicInput({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "e.g., 'The future of renewable energy'" 
}: TopicInputProps) {
  const [topic, setTopic] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim() && !isLoading) {
      onSubmit(topic.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="relative w-full group">
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--primary-color)]/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500"></div>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass glass-hover rounded-3xl p-1 transition-all duration-300">
          <div className="relative flex items-center">
            {/* Floating label */}
            <label 
              className={`absolute left-6 text-sm font-medium transition-all duration-300 pointer-events-none ${
                isFocused || topic 
                  ? '-top-2 text-xs bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent px-2' 
                  : 'top-1/2 -translate-y-1/2 text-gray-400'
              }`}
            >
              {isFocused || topic ? 'Presentation Topic' : placeholder}
            </label>
            
            <input 
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className={`w-full h-16 pl-6 pr-44 rounded-3xl bg-transparent border-none focus:outline-none text-lg text-white placeholder-transparent transition-all duration-300 ${
                isFocused || topic ? 'pt-6 pb-2' : ''
              }`}
              placeholder=""
            />
            
            {/* Generate button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <div className="gradient-border rounded-2xl">
                <Button
                  type="submit"
                  disabled={!topic.trim() || isLoading}
                  className="flex items-center justify-center rounded-2xl h-12 px-8 bg-gradient-to-r from-[var(--primary-color)] to-purple-600 hover:from-[var(--primary-color-hover)] hover:to-purple-700 text-white font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>✨</span>
                      <span>Generate</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input suggestions */}
        {isFocused && !topic && (
          <div className="absolute top-full left-0 right-0 mt-2 glass rounded-2xl p-4 opacity-0 animate-in slide-in-from-top-2 duration-300 opacity-100">
            <div className="text-sm text-gray-300 mb-3 font-medium">💡 Try these topics:
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                'Climate change solutions',
                'AI in healthcare',
                'Space exploration',
                'Renewable energy',
                'Digital transformation'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setTopic(suggestion);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
