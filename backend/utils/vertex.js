import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Google AI Studio client (simple API key, no GCP project needed)
const genAI = new GoogleGenerativeAI(process.env.LLM_API_KEY);
const generativeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export { generativeModel, supabase };
