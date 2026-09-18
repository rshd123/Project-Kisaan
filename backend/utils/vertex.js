import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Google AI Studio client (new SDK with AQ... key format support)
const ai = new GoogleGenAI({ apiKey: process.env.LLM_API_KEY });

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export { ai, supabase };
