/**
 * Cognitive Shadow Authentication Layer
 * 
 * Clean service boundary for authentication.
 * Structured so that Supabase Auth (supabase.auth.*)
 * can replace this mock implementation without touching the UI layer.
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalNotes?: string;
  primaryLocation?: string;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

const STORAGE_KEY = 'cs_auth_session';
const USERS_REGISTRY_KEY = 'cs_users_registry';

export const DEMO_USER: User = {
  id: 'usr-alex-morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  bloodGroup: 'O+',
  allergies: 'Penicillin, Cephalosporins',
  medicalNotes: 'Asthma inhaler in travel kit. Advance medical proxy designated to Rahul Morgan.',
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

export const authService = {
  /**
   * Get current session from local storage or null if unauthenticated.
   * Signed out by default for a new browser / session.
   */
  getSession(): AuthSession {
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

  /**
   * Log in user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    let existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!existingUser) {
      // If it's the demo account
      if (cleanEmail === 'alex.morgan@example.com' || cleanEmail === 'alex.morgan@shadowops.internal') {
        existingUser = DEMO_USER;
      } else {
        // Derive user from email address (e.g. "sarah.connor@example.com" -> "Sarah Connor")
        const namePart = cleanEmail.split('@')[0]
          .split(/[\._-]/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ');

        existingUser = {
          id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: namePart || 'Registered User',
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

  /**
   * Register a new account
   */
  async signup(name: string, email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getRegisteredUsers();
    
    // Check if user already exists
    let existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      existing.name = name.trim();
      const session: AuthSession = {
        user: existing,
        token: 'mock-jwt-token-' + Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
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
    return newUser;
  },

  /**
   * Log out and clear session
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Request password reset token
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!email) {
      throw new Error('Please enter a valid email address.');
    }
    return {
      success: true,
      message: `If an account exists for ${email}, a secure reset link has been dispatched.`
    };
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    return { success: true };
  },

  /**
   * Update profile details
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    const session = this.getSession();
    if (!session.user) throw new Error('Not authenticated');

    const updatedUser = { ...session.user, ...updates };
    const updatedSession = { ...session, user: updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSession));

    // Update in user registry
    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.id === updatedUser.id || u.email.toLowerCase() === updatedUser.email.toLowerCase());
    if (index >= 0) {
      users[index] = updatedUser;
      saveRegisteredUsers(users);
    }

    return updatedUser;
  }
};
