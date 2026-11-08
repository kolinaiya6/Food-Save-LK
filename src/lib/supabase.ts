import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration storage key
const SUPABASE_CONFIG_KEY = 'foodsavers_supabase_credentials';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// User-provided real Supabase Project Credentials
export const DEFAULT_SUPABASE_URL = 'https://gmtzbwgbgodrfzvmlimd.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtdHpid2diZ29kcmZ6dm1saW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0OTYyMTMsImV4cCI6MjEwOTA3MjIxM30.NXNsuBE85DE20VVjbfLX9W7yfy3hiSeCSgcs01KmgPM';

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading saved Supabase config:', e);
  }

  // Fallback to configured defaults or env variables
  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    initSupabaseClient();
  } catch (e) {
    console.error('Failed to save Supabase config', e);
  }
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(): SupabaseClient | null {
  const config = getSavedSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  const config = getSavedSupabaseConfig();
  return Boolean(config.url && config.anonKey && config.url.startsWith('https://'));
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!url.startsWith('https://') || !anonKey) {
      return { success: false, message: 'වලංගු Supabase URL එකක් සහ Anon Key එකක් ඇතුළත් කරන්න (https://...)' };
    }
    const testClient = createClient(url, anonKey);
    const { error } = await testClient.from('food_deals').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      if (error.message.includes('relation "food_deals" does not exist')) {
        return {
          success: true,
          message: 'සම්බන්ධතාව සාර්ථකයි! (නමුත් tables තවමත් නැත. පහත SQL Script එක Run කරන්න).',
        };
      }
      return { success: false, message: `සම්බන්ධතා දෝෂය: ${error.message}` };
    }
    return { success: true, message: 'Supabase Project එක සමග සාර්ථකව සම්බන්ධ විය!' };
  } catch (err: any) {
    return { success: false, message: `දෝෂය: ${err?.message || 'සම්බන්ධ වීමට නොහැකි විය'}` };
  }
}

/**
 * Uploads an image file to Supabase Storage bucket.
 * If bucket doesn't exist yet, falls back to a base64 DataURL so the preview and persistence never breaks.
 */
export async function uploadImage(file: File, bucket: string = 'food-images'): Promise<string> {
  const client = getSupabase();
  if (client) {
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await client.storage.from(bucket).upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (!error && data) {
        const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return publicUrlData.publicUrl;
        }
      } else {
        console.warn('Supabase storage upload error, using local DataURL fallback:', error?.message);
      }
    } catch (e) {
      console.warn('Storage exception, using DataURL fallback:', e);
    }
  }

  // Fallback to Base64 Data URL so images display immediately and work offline/locally
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
}
