'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export function EditorHeader() {
  return (
    <header className="w-full border-b border-b-[#264532] px-10 py-3 font-spline">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-white">
          <div className="size-4">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor"></path>
              <path fillRule="evenodd" clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.02em]">SpeakDeck</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <nav className="hidden md:flex items-center gap-9">
            <a className="text-white text-sm font-medium leading-normal" href="#">Home</a>
            <a className="text-white text-sm font-medium leading-normal" href="#">Templates</a>
            <a className="text-white text-sm font-medium leading-normal" href="#">My Presentations</a>
            <a className="text-white text-sm font-medium leading-normal" href="#">Help</a>
          </nav>
          <button
            className="flex items-center justify-center overflow-hidden rounded-full h-10 bg-[#264532] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCAWUidygzpaDnLkvHPXqyQ0FO50aymajli9sv_X3ViCobVchY-rlep4tllwB4WntwJfBQB_pf-NhBuImpkFnpinnKAoMpbWT6_yJbQqTWJ50kzeVcjq_cihilpOfAxvuPEu_dmaMFhkp-zuAclTyOncwq-g8clv5CXBwNeWzUEV7CgvfwHBtqBrMLrOii-aiW_TmIXY7tMRcTH6x1oz7AAsI0nqBGG3s_2EnVtUSBkEk5-uV5MzhLxMaJw7dyDPq0FIiStrCVOFQ)' }}
          />
        </div>
      </div>
    </header>
  );
}

