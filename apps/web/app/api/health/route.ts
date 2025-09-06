import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../src/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test basic response
    console.log('Health check called');
    
    // Test environment variables
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasElevenLabsKey = !!process.env.ELEVENLABS_API_KEY;
    
    console.log('Environment check:', {
      hasSupabaseUrl,
      hasSupabaseKey,
      hasGeminiKey,
      hasElevenLabsKey,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    });

    // Test Supabase connection
    let supabaseStatus = 'unknown';
    try {
      const { data, error } = await supabase.from('presentations').select('count', { count: 'exact', head: true });
      if (error) {
        supabaseStatus = `error: ${error.message}`;
      } else {
        supabaseStatus = 'connected';
      }
    } catch (err) {
      supabaseStatus = `exception: ${err}`;
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl,
        hasSupabaseKey,
        hasGeminiKey,
        hasElevenLabsKey,
      },
      supabase: supabaseStatus,
      nodeEnv: process.env.NODE_ENV,
    };

    console.log('Health check result:', health);
    
    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
