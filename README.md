# SpeakDeck 🎤

**Slides that speak** - Turn any topic into a narrated, visual-rich presentation deck in seconds.

SpeakDeck is an AI-powered presentation builder that creates complete slide decks with:
- 🤖 **AI-Generated Content**: Smart text and structure using Gemini API
- 🎨 **Dynamic Visuals**: Custom images generated for each slide
- 🎙️ **Voice Narration**: Professional voice synthesis with ElevenLabs API
- ⚡ **Real-time Generation**: Complete presentations in under 60 seconds
- 🔄 **Smart Fallbacks**: Graceful handling of API quotas with pre-generated content

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- Supabase project (for database and storage)
- API keys for Gemini, Nano Banana, and ElevenLabs

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your API keys in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Service API Keys
   GEMINI_API_KEY=your_gemini_api_key
   NANO_BANANA_API_KEY=your_nano_banana_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

3. **Setup Supabase database**
   
   Run the SQL migration in your Supabase dashboard:
   ```sql
   -- Copy and run the contents of scripts/supabase/01-create-schema.sql
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Visit http://localhost:3000**

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + Zustand
- **Backend**: Next.js API Routes + Supabase (PostgreSQL + Realtime)
- **AI Services**: Gemini + Nano Banana + ElevenLabs with fallback system
- **Deployment**: Optimized for Vercel with global CDN

## 🎯 Features

### Core MVP Features
- [x] Topic input with validation and sample suggestions
- [x] AI-powered content generation (3-5 slides)
- [x] Dynamic visual creation for each slide
- [x] Voice narration synthesis
- [x] Real-time progress tracking with live updates
- [x] Presentation viewer with navigation controls
- [x] Audio playback with volume control
- [x] Fallback deck system for API limits
- [x] Responsive design (desktop + mobile)
- [x] Keyboard navigation (arrow keys, spacebar)

### Technical Features
- [x] TypeScript throughout with shared types
- [x] Monorepo structure with npm workspaces
- [x] Real-time subscriptions with Supabase
- [x] API quota management and graceful degradation
- [x] Retry logic with exponential backoff
- [x] Comprehensive error handling

## 🔧 Development

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run unit tests
npm run test:e2e        # Run end-to-end tests
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**: `npm install -g vercel && vercel`
2. **Set environment variables** in Vercel dashboard
3. **Deploy**: `vercel --prod`

---

**SpeakDeck** - Making presentations speak since 2024 🎤✨

Built with Next.js, Supabase, and modern AI APIs for the ultimate presentation experience.
