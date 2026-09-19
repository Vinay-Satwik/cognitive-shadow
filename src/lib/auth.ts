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
  bloodGroup?: string;
  medicalNotes?: string;
  hasCompletedOnboarding?: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User | null;
  token: string | null;
}

const STORAGE_KEY = 'cs_auth_session';

const DEFAULT_USER: User = {
  id: 'usr-alex-morgan',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  bloodGroup: 'O+',
  medicalNotes: 'Penicillin allergy; contact Dr. Mehta for emergency history.',
  hasCompletedOnboarding: true,
  createdAt: '2025-01-01T00:00:00Z'
};

export const authService = {
  /**
   * Get current session from local storage or default initial state
   */
  getSession(): AuthSession {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth session from localStorage', e);
    }
    // Default active session for demonstration
    const defaultSession: AuthSession = {
      user: DEFAULT_USER,
      token: 'mock-jwt-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSession));
    return defaultSession;
  },

  /**
   * Log in user with email and password
   */
  async login(email: string, password: string): Promise<User> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!email || !password) {
      throw new Error('Please provide both email and password.');
    }

    // Mock validation
    const user: User = {
      ...DEFAULT_USER,
      email
    };

    const session: AuthSession = {
      user,
      token: 'mock-jwt-token-' + Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return user;
  },

  /**
   * Register a new account
   */
  async signup(name: string, email: string, password: string): Promise<User> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (!name || !email || !password) {
      throw new Error('All fields are required.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      bloodGroup: 'O+',
      medicalNotes: '',
      createdAt: new Date().toISOString()
    };

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
    await new Promise((resolve) => setTimeout(resolve, 200));
    const emptySession: AuthSession = {
      user: null,
      token: null
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emptySession));
  },

  /**
   * Request password reset token
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
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
    await new Promise((resolve) => setTimeout(resolve, 400));
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
    return updatedUser;
  }
};
