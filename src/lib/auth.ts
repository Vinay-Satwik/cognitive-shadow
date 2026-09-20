/**
 * Cognitive Shadow Authentication Layer
 * 
 * Production Supabase Auth integration with local development fallback.
 * Strictly enforces user isolation, Row Level Security, and handles
 * email confirmation, session restoration, and dynamic profiles.
 */

import { supabase, isSupabaseConfigured, authBackend } from './supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  avatar?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  emergencyDirective?: string;
  primaryLocation?: string;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

export interface SignUpResult {
  user: User | null;
  requiresEmailConfirmation: boolean;
  message?: string;
}

export interface AuthService {
  getSession(): Promise<AuthSession>;
  getCurrentUser(): Promise<User | null>;
  login(email: string, password: string): Promise<User>;
  signup(name: string, email: string, password: string): Promise<SignUpResult>;
  logout(): Promise<void>;
  forgotPassword(email: string): Promise<{ success: boolean; message: string }>;
  resetPassword(token: string, newPassword: string): Promise<{ success: boolean }>;
  updateProfile(updates: Partial<User>): Promise<User>;
  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void };
}

const STORAGE_KEY = 'cs_auth_session';
const USERS_REGISTRY_KEY = 'cs_users_registry';

export const DEMO_USER: User = {
  id: 'usr-alex-morgan',
  name: 'Alex Morgan',
  firstName: 'Alex',
  email: 'alex.morgan@example.com',
  phone: '+1 (555) 382-9901',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Cephalosporins',
  medicalNotes: 'Asthma inhaler in travel kit. Advance medical proxy designated to Rahul Morgan.',
  emergencyDirective: 'In the event of medical incapacitation, notify Rahul Morgan immediately.',
  primaryLocation: 'San Francisco, CA',
  hasCompletedOnboarding: true,
  createdAt: '2025-01-01T00:00:00Z'
};

function getRegisteredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {
    console.warn('Failed to parse user registry', e);
  }
  const initial = [DEMO_USER];
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(initial));
  return initial;
}

function saveRegisteredUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Failed to persist user registry', e);
  }
}

function mapSupabaseProfileToUser(authUser: any, profile?: any): User {
  const fullName =
    profile?.full_name ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    (authUser.email ? authUser.email.split('@')[0] : 'Registered User');
  const firstName =
    profile?.first_name ||
    authUser.user_metadata?.first_name ||
    fullName.split(' ')[0] ||
    'User';

  return {
    id: authUser.id,
    email: authUser.email || profile?.email || '',
    name: fullName,
    firstName,
    avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url,
    phone: profile?.phone || '',
    bloodGroup: profile?.blood_group || '',
    allergies: profile?.allergies || '',
    medicalNotes: profile?.medical_notes || '',
    emergencyDirective: profile?.emergency_directive || '',
    primaryLocation: profile?.primary_location || '',
    hasCompletedOnboarding: Boolean(
      profile?.has_completed_onboarding ??
      authUser.user_metadata?.has_completed_onboarding ??
      false
    ),
    createdAt: profile?.created_at || authUser.created_at || new Date().toISOString(),
    updatedAt: profile?.updated_at
  };
}

// ---------------------------------------------------------------------------
// 1. SUPABASE AUTHENTICATION SERVICE IMPLEMENTATION
// ---------------------------------------------------------------------------
const supabaseAuthService: AuthService = {
  async getSession(): Promise<AuthSession> {
    if (!supabase) return { user: null, token: null };

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        return { user: null, token: null };
      }

      // Fetch user profile from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      const user = mapSupabaseProfileToUser(session.user, profile);
      return {
        user,
        token: session.access_token
      };
    } catch (err) {
      console.error('[Supabase Auth] Failed to restore session:', err);
      return { user: null, token: null };
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session.user;
  },

  async login(email: string, password: string): Promise<User> {
    if (!supabase) throw new Error('Supabase client is not available.');
    if (!email || !password) throw new Error('Please provide both email and password.');

    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials.');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Please confirm your email address before signing in. Check your inbox for the activation link.');
      }
      if (msg.includes('failed to fetch') || msg.includes('network')) {
        throw new Error('Network error: Unable to connect to authentication server. Please check your connection.');
      }
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error('Authentication failed.');
    }

    // Load user profile from profiles table
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    // Fallback profile creation if not created by DB trigger yet
    if (!profile) {
      const metaName = data.user.user_metadata?.full_name || data.user.user_metadata?.name || '';
      const metaFirst = data.user.user_metadata?.first_name || (metaName ? metaName.split(' ')[0] : '');
      const { data: newProf } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email || cleanEmail,
          full_name: metaName,
          first_name: metaFirst,
          has_completed_onboarding: false
        }, { onConflict: 'id' })
        .select()
        .maybeSingle();
      profile = newProf;
    }

    return mapSupabaseProfileToUser(data.user, profile);
  },

  async signup(name: string, email: string, password: string): Promise<SignUpResult> {
    if (!supabase) throw new Error('Supabase client is not available.');
    if (!name || !email || !password) throw new Error('All fields are required.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const firstName = cleanName.split(' ')[0] || cleanName;

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          name: cleanName,
          first_name: firstName
        }
      }
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('user already exists')) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      if (msg.includes('password should be') || msg.includes('weak password')) {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      if (msg.includes('valid email') || msg.includes('invalid email')) {
        throw new Error('Please enter a valid email address.');
      }
      throw new Error(error.message || 'Failed to create account.');
    }

    if (!data.user) {
      throw new Error('User creation returned no user record.');
    }

    // Check whether an active session was created or email confirmation is required
    const requiresEmailConfirmation = !data.session;

    let profile = null;
    if (data.session) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        profile = prof;
      } catch (err) {
        console.warn('[Supabase Auth] Profile query note:', err);
      }

      if (!profile) {
        try {
          const { data: newProf } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: cleanEmail,
              full_name: cleanName,
              first_name: firstName,
              has_completed_onboarding: false
            }, { onConflict: 'id' })
            .select()
            .maybeSingle();
          profile = newProf;
        } catch (upsertErr) {
          console.warn('[Supabase Auth] Profile fallback upsert note:', upsertErr);
        }
      }
    }

    const user = mapSupabaseProfileToUser(data.user, profile);

    return {
      user: requiresEmailConfirmation ? null : user,
      requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? 'Account registered. Please check your email to confirm your account before signing in.'
        : undefined
    };
  },

  async logout(): Promise<void> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Supabase Auth] Sign out error:', err);
      }
    }
    localStorage.removeItem(STORAGE_KEY);
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    if (!supabase) throw new Error('Supabase client is not available.');
    if (!email) throw new Error('Email is required.');

    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      throw new Error(error.message || 'Failed to send reset link.');
    }

    return {
      success: true,
      message: 'Password reset link sent to your email. Check your inbox to proceed.'
    };
  },

  async resetPassword(_token: string, newPassword: string): Promise<{ success: boolean }> {
    if (!supabase) throw new Error('Supabase client is not available.');
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message || 'Failed to update password.');
    }

    return { success: true };
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!supabase) throw new Error('Supabase client is not available.');

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) {
      throw new Error('Not authenticated.');
    }

    const profileUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (updates.name !== undefined) {
      profileUpdates.full_name = updates.name.trim();
      profileUpdates.first_name = updates.name.trim().split(' ')[0];
    }
    if (updates.phone !== undefined) profileUpdates.phone = updates.phone;
    if (updates.bloodGroup !== undefined) profileUpdates.blood_group = updates.bloodGroup;
    if (updates.allergies !== undefined) profileUpdates.allergies = updates.allergies;
    if (updates.medicalNotes !== undefined) profileUpdates.medical_notes = updates.medicalNotes;
    if (updates.emergencyDirective !== undefined) profileUpdates.emergency_directive = updates.emergencyDirective;
    if (updates.primaryLocation !== undefined) profileUpdates.primary_location = updates.primaryLocation;
    if (updates.hasCompletedOnboarding !== undefined) profileUpdates.has_completed_onboarding = updates.hasCompletedOnboarding;
    if (updates.avatar !== undefined) profileUpdates.avatar_url = updates.avatar;

    // 1. Sync Supabase Auth user metadata first (always accessible to authenticated user)
    const userMetaUpdates: Record<string, any> = {};
    if (updates.name) {
      userMetaUpdates.full_name = updates.name.trim();
      userMetaUpdates.name = updates.name.trim();
      userMetaUpdates.first_name = updates.name.trim().split(' ')[0];
    }
    if (updates.hasCompletedOnboarding !== undefined) {
      userMetaUpdates.has_completed_onboarding = updates.hasCompletedOnboarding;
    }
    if (updates.phone !== undefined) userMetaUpdates.phone = updates.phone;
    if (updates.bloodGroup !== undefined) userMetaUpdates.blood_group = updates.bloodGroup;
    if (updates.allergies !== undefined) userMetaUpdates.allergies = updates.allergies;
    if (updates.primaryLocation !== undefined) userMetaUpdates.primary_location = updates.primaryLocation;

    if (Object.keys(userMetaUpdates).length > 0) {
      try {
        const { data: updatedAuthUser, error: metaErr } = await supabase.auth.updateUser({
          data: userMetaUpdates
        });
        if (metaErr) {
          console.warn('[Supabase Auth] Metadata update notice:', {
            message: metaErr.message,
            status: metaErr.status
          });
        } else if (updatedAuthUser?.user) {
          authData.user = updatedAuthUser.user;
        }
      } catch (metaCatch) {
        console.warn('[Supabase Auth] Metadata sync exception:', metaCatch);
      }
    }

    // 2. Target public.profiles table using authenticated user's ID
    let updatedProfile: any = null;
    const { data: updatedRows, error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', authData.user.id)
      .select();

    if (!updateError && updatedRows && updatedRows.length > 0) {
      updatedProfile = updatedRows[0];
    } else {
      if (updateError) {
        console.warn('[Supabase Auth] Direct update notice, attempting upsert:', {
          message: updateError.message,
          code: updateError.code,
          details: updateError.details,
          hint: updateError.hint
        });
      }

      const metaName = authData.user.user_metadata?.full_name || authData.user.user_metadata?.name || updates.name || '';
      const metaFirst = authData.user.user_metadata?.first_name || (metaName ? metaName.split(' ')[0] : '');

      const newProfilePayload = {
        id: authData.user.id,
        email: authData.user.email || '',
        full_name: updates.name ? updates.name.trim() : metaName,
        first_name: updates.name ? updates.name.trim().split(' ')[0] : metaFirst,
        ...profileUpdates
      };

      const { data: upsertData, error: upsertError } = await supabase
        .from('profiles')
        .upsert(newProfilePayload, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (upsertError) {
        console.error('[Supabase Auth] Profile table upsert error:', {
          message: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        });
        if (upsertError.code === '42501') {
          console.warn(
            '[Supabase Auth] 42501 Permission Denied on public.profiles: Run supabase/migrations/002_fix_profiles_and_grants.sql in the Supabase SQL Editor.'
          );
        }
      } else {
        updatedProfile = upsertData;
      }
    }

    // 3. Fallback select if updatedProfile is not set
    if (!updatedProfile) {
      try {
        const { data: fetchedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
        if (fetchedProfile) {
          updatedProfile = fetchedProfile;
        }
      } catch (fErr) {
        console.warn('[Supabase Auth] Profile fallback select note:', fErr);
      }
    }

    return mapSupabaseProfileToUser(authData.user, updatedProfile);
  },

  onAuthStateChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
    const client = supabase;
    if (!client) {
      return { unsubscribe: () => {} };
    }

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }

      try {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        callback(mapSupabaseProfileToUser(session.user, profile));
      } catch (err) {
        console.warn('[Supabase Auth] Auth state change profile fetch note:', err);
        callback(mapSupabaseProfileToUser(session.user));
      }
    });

    return {
      unsubscribe: () => subscription.unsubscribe()
    };
  }
};

// ---------------------------------------------------------------------------
// 2. LOCAL DEVELOPMENT MOCK AUTHENTICATION SERVICE IMPLEMENTATION
// ---------------------------------------------------------------------------
const localAuthService: AuthService = {
  async getSession(): Promise<AuthSession> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.user) {
          return {
            user: parsed.user,
            token: parsed.token || 'mock-jwt-token'
          };
        }
      }
    } catch (e) {
      console.warn('Failed to parse auth session from localStorage', e);
    }
    // Signed out by default
    return {
      user: null,
      token: null
    };
  },

  async getCurrentUser(): Promise<User | null> {
    const session = await this.getSession();
    return session.user;
  },

  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    let existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      if (cleanEmail === 'alex.morgan@example.com' || cleanEmail === 'alex.morgan@shadowops.internal') {
        existingUser = DEMO_USER;
      } else {
        const namePart = cleanEmail.split('@')[0]
          .split(/[\._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        existingUser = {
          id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: namePart || 'Registered User',
          firstName: namePart ? namePart.split(' ')[0] : 'User',
          email: cleanEmail,
          hasCompletedOnboarding: false,
          createdAt: new Date().toISOString()
        };
        users.push(existingUser);
        saveRegisteredUsers(users);
      }
    }

    const session: AuthSession = {
      user: existingUser,
      token: 'mock-jwt-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return existingUser;
  },

  async signup(name: string, email: string, password: string): Promise<SignUpResult> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();

    let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.name = name.trim();
      existing.firstName = name.trim().split(' ')[0];
      const session: AuthSession = {
        user: existing,
        token: 'mock-jwt-token-' + Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return {
        user: existing,
        requiresEmailConfirmation: false
      };
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      firstName: name.trim().split(' ')[0],
      email: cleanEmail,
      bloodGroup: '',
      medicalNotes: '',
      hasCompletedOnboarding: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    const session: AuthSession = {
      user: newUser,
      token: 'mock-jwt-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return {
      user: newUser,
      requiresEmailConfirmation: false
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    localStorage.removeItem(STORAGE_KEY);
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!email) {
      throw new Error('Email is required.');
    }
    return {
      success: true,
      message: 'Reset link dispatched. (Development Mock: check simulated console log)'
    };
  },

  async resetPassword(_token: string, newPassword: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    return { success: true };
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const session = await this.getSession();
    if (!session.user) throw new Error('Not authenticated');

    const updatedUser = {
      ...session.user,
      ...updates,
      firstName: updates.name ? updates.name.trim().split(' ')[0] : session.user.firstName,
      updatedAt: new Date().toISOString()
    };
    const updatedSession = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));

    const users = getRegisteredUsers();
    const index = users.findIndex(
      (u) => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase()
    );
    if (index >= 0) {
      users[index] = updatedUser;
      saveRegisteredUsers(users);
    }

    return updatedUser;
  },

  onAuthStateChange(_callback: (user: User | null) => void): { unsubscribe: () => void } {
    return {
      unsubscribe: () => {}
    };
  }
};

// ---------------------------------------------------------------------------
// 3. EXPORT UNIFIED AUTH SERVICE
// ---------------------------------------------------------------------------
export const authService: AuthService = isSupabaseConfigured
  ? supabaseAuthService
  : localAuthService;
