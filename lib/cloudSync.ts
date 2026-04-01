'use client';

import { supabase } from './supabase';

interface CloudLibrary {
  games: unknown[];
  categories: string[];
  customVibes: string[];
  settings: unknown;
  lastSaved: string;
}

// Save library to Supabase — upserts the entire library as JSONB
export async function saveToCloud(userId: string, library: CloudLibrary): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('libraries')
    .upsert({
      user_id: userId,
      library_data: library,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Cloud save error:', error);
    return false;
  }
  return true;
}

// Load library from Supabase
export async function loadFromCloud(userId: string): Promise<CloudLibrary | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('libraries')
    .select('library_data')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    if (error?.code === 'PGRST116') {
      return null;
    }
    console.error('Cloud load error:', error);
    return null;
  }

  return data.library_data as CloudLibrary;
}

// Save user profile info
export async function saveProfile(userId: string, profile: {
  displayName: string;
  avatarUrl?: string;
  isPublic?: boolean;
}): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .upsert({
      user_id: userId,
      display_name: profile.displayName,
      avatar_url: profile.avatarUrl || null,
      is_public: profile.isPublic ?? false,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Profile save error:', error);
    return false;
  }
  return true;
}

// Load public profile by slug
export async function loadPublicProfile(slug: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, user_id')
    .eq('slug', slug)
    .eq('is_public', true)
    .single();

  if (error || !data) return null;

  const library = await loadFromCloud(data.user_id);

  return {
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    library,
  };
}
