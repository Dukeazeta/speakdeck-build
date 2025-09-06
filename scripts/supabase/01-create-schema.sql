-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'generating_text', 'generating_visuals', 'generating_audio', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_slides INTEGER NOT NULL DEFAULT 0,
    generation_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    audio_url TEXT,
    generation_status JSONB DEFAULT '{"text": "pending", "image": "pending", "audio": "pending"}'::jsonb,
    ai_prompts JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(presentation_id, slide_number)
);

-- Create fallback_decks table
CREATE TABLE IF NOT EXISTS fallback_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    slides JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON presentations(created_at);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slides_slide_number ON slides(slide_number);
CREATE INDEX IF NOT EXISTS idx_fallback_decks_topic ON fallback_decks(topic);
CREATE INDEX IF NOT EXISTS idx_fallback_decks_active ON fallback_decks(is_active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON presentations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE fallback_decks ENABLE ROW LEVEL SECURITY;

-- Create policies for presentations (allow all for MVP, can be restricted later)
CREATE POLICY "Allow all access to presentations for authenticated users" ON presentations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all access to slides for authenticated users" ON slides
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to fallback_decks for authenticated users" ON fallback_decks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create storage buckets for images and audio
INSERT INTO storage.buckets (id, name, public) VALUES
    ('presentation-images', 'presentation-images', true),
    ('presentation-audio', 'presentation-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for images
CREATE POLICY "Allow authenticated upload to presentation-images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'presentation-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public read from presentation-images" ON storage.objects
    FOR SELECT USING (bucket_id = 'presentation-images');

-- Storage policies for audio
CREATE POLICY "Allow authenticated upload to presentation-audio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'presentation-audio' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Allow public read from presentation-audio" ON storage.objects
    FOR SELECT USING (bucket_id = 'presentation-audio');
