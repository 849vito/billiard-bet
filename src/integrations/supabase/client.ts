
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hsbazqkwbrcehdjdhfef.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzYmF6cWt3YnJjZWhkamRoZmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMDk5MTMsImV4cCI6MjA2MTc4NTkxM30.Ub2c0kNnCHqQTyCIIXQJJnk6tA46uN8H7smvWdH-AkI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
