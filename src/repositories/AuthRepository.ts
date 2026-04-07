import { STORAGE_KEYS } from '@/constants';
import { User, Session } from '@/types';
import { hashPassword } from '@/utils/hashPassword';

export function getAllUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.users);
    if (!raw) return [];
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

function saveSession(session: Session): void {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(STORAGE_KEYS.session);
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (session && session.username && session.isAuthenticated) {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

export interface AuthResult {
  success: boolean;
  session?: Session;
  error?: string;
}

export async function signup(username: string, password: string): Promise<AuthResult> {
  const trimmedUsername = username.trim();

  if (trimmedUsername.length < 3 || trimmedUsername.length > 32) {
    return { success: false, error: 'Username must be between 3 and 32 characters.' };
  }

  if (!/^[a-zA-Z0-9]+$/.test(trimmedUsername)) {
    return { success: false, error: 'Username must contain only letters and numbers.' };
  }

  if (password.length < 6 || password.length > 64) {
    return { success: false, error: 'Password must be between 6 and 64 characters.' };
  }

  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { success: false, error: 'Password must contain at least one letter and one number.' };
  }

  const users = getAllUsers();
  const existingUser = users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (existingUser) {
    return { success: false, error: 'Username already exists.' };
  }

  const passwordHash = await hashPassword(password);

  const newUser: User = {
    username: trimmedUsername,
    passwordHash,
  };

  users.push(newUser);
  saveUsers(users);

  const session: Session = {
    username: trimmedUsername,
    isAuthenticated: true,
    loginTimestamp: Date.now(),
  };

  saveSession(session);

  return { success: true, session };
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const trimmedUsername = username.trim();

  if (!trimmedUsername || !password) {
    return { success: false, error: 'Username and password are required.' };
  }

  const users = getAllUsers();
  const user = users.find(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const passwordHash = await hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const session: Session = {
    username: user.username,
    isAuthenticated: true,
    loginTimestamp: Date.now(),
  };

  saveSession(session);

  return { success: true, session };
}

export function logout(): void {
  clearSession();
}