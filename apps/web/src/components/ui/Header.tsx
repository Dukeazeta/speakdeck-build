'use client';

import React from 'react';
import { Button } from './button';

interface HeaderProps {
  onNewPresentation?: () => void;
  showNewPresentationButton?: boolean;
  variant?: 'floating' | 'solid';
}

export function Header({ onNewPresentation, showNewPresentationButton = true, variant = 'floating' }: HeaderProps) {
  if (variant === 'solid') {
    return (
      <header className="w-full border-b border-b-[#264532] px-6 md:px-10 py-3 font-spline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 text-white">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" />
                <path fillRule="evenodd" clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" />
              </svg>
            </div>
            <h2 className="text-white text-base md:text-lg font-bold leading-tight tracking-[-0.02em]">SpeakDeck</h2>
          </div>
          <div className="flex flex-1 justify-end gap-6 md:gap-8">
            <nav className="hidden md:flex items-center gap-6">
              <a className="text-white/90 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Home</a>
              <a className="text-white/90 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Templates</a>
              <a className="text-white/90 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Pricing</a>
            </nav>
            <div className="flex gap-2">
              <button className="flex min-w-[96px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#38e07b] hover:bg-[#2fd571] text-[#122118] text-sm font-bold leading-normal tracking-[0.015em] transition-colors">
                <span className="truncate">Get started</span>
              </button>
              <button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 border border-[#264532] bg-transparent text-white/90 hover:text-white hover:bg-[#264532] text-sm font-medium leading-normal tracking-[0.015em] transition-colors">
                <span className="truncate">Log in</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-float">
      <header className="floating-nav rounded-2xl px-8 py-4 mx-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            {/* Diamond Logo with glow effect */}
            <div className="relative">
              <svg 
                className="h-10 w-10 text-[var(--primary-color)] animate-glow" 
                fill="none" 
                viewBox="0 0 48 48" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  clipRule="evenodd" 
                  d="M24 0L48 24L24 48L0 24L24 0ZM21.9999 35.9999V12L9.24256 24L21.9999 35.9999Z" 
                  fill="currentColor" 
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SpeakDeck
            </h2>
          </div>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
            <a className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group" href="#">
              Home
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group" href="#">
              Templates
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group" href="#">
              Pricing
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
            <a className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 relative group" href="#">
              Blog
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-[var(--primary-color)] to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </a>
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            {showNewPresentationButton && (
              <div className="gradient-border rounded-xl">
                <Button 
                  onClick={onNewPresentation}
                  className="hidden sm:flex items-center justify-center rounded-xl h-10 px-6 bg-gradient-to-r from-[var(--primary-color)] to-purple-600 hover:from-[var(--primary-color-hover)] hover:to-purple-700 text-white text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  ✨ New Presentation
                </Button>
              </div>
            )}
            
            {/* User Avatar with glass border */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-purple-500 blur-sm opacity-75"></div>
              <div 
                className="relative w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300" 
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB8_hABfpQCqvXN_S1wXH0s03Gj-k25CT3WyXMhxXjoh9ckcS_w_SjnwYMAObuQpIXqP1SLz05Mh8G1krOpFYwNAwBWV1KZx3xMfAXyK1CsxC1f0vCfuRh028DUsSzrxoBQWj7LUOdRDY8sCjI2YJ0KZg7snGqOFMT4Zl-QOXxyF40HJEgX360QWj-Rjl_pKNQv6rdqS4fAFGSD7wne4z0osKSOdH0V3AVDmu7gwC-JmDsQlaLQUzytdCtGGl61uhN7OepsdsLEmXY4")`
                }}
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
