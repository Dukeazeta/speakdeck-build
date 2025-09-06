"use client";

import React, { useState } from "react";

interface LandingHeroProps {
  onSubmit: (topic: string) => void;
  isLoading?: boolean;
}

export function LandingHero({ onSubmit, isLoading = false }: LandingHeroProps) {
  const [topic, setTopic] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isLoading) return;
    onSubmit(topic.trim());
  };

  return (
    <section className="font-spline">
      <div className="px-10 md:px-20 lg:px-40 py-8 md:py-10 flex justify-center">
        <div className="w-full max-w-[960px]">
          <h1 className="text-white text-center text-[32px] md:text-[40px] font-bold leading-tight tracking-[-0.02em] pb-3 pt-6">
            Turn your ideas into narrated presentations
          </h1>

          {/* Move the textbox far down from the hero heading */}
          <form onSubmit={handleSubmit} className="px-4 mt-32 md:mt-48 lg:mt-56 flex justify-center">
            <div className="relative w-full max-w-[880px]">
              <label htmlFor="topic" className="sr-only">Presentation Topic</label>
              <input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What's your presentation about?"
                className="w-full rounded-full bg-[#264532] text-white placeholder:text-[#96c5a9] h-[68px] md:h-[80px] px-6 pr-44 text-xl md:text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#38e07b]/40 transition-shadow"
              />
              {/* Button inside the textbox */}
              <button
                type="submit"
                disabled={!topic.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-[56px] md:h-[64px] px-6 md:px-7 rounded-full bg-[#38e07b] hover:bg-[#2fd571] text-[#122118] text-base md:text-lg font-bold tracking-[0.015em] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
