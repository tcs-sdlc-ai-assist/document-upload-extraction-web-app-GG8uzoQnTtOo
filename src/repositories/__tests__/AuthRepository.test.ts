import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as AuthRepository from '@/repositories/AuthRepository';
import { STORAGE_KEYS } from '@/constants';

vi.mock('@/utils/hashPassword', () => ({
  hashPassword: vi.fn(async (password: string) => `hashed_${password}`),
}));

describe('AuthRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('signup', () => {
    it('creates a new user and returns a session on success', async () => {
      const result = await AuthRepository.signup('alice', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.username).toBe('alice');
      expect(result.session!.isAuthenticated).toBe(true);
      expect(result.session!.loginTimestamp).toBeGreaterThan(0);
    });

    it('persists the user to localStorage', async () => {
      await AuthRepository.signup('bob', 'secret99');

      const users = AuthRepository.getAllUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('bob');
      expect(users[0].passwordHash).toBe('hashed_secret99');
    });

    it('rejects signup with a duplicate username', async () => {
      await AuthRepository.signup('alice', 'password123');
      const result = await AuthRepository.signup('alice', 'differentpass1');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.session).toBeUndefined();
    });

    it('allows multiple unique users to sign up', async () => {
      const result1 = await AuthRepository.signup('user1', 'pass1abc');
      const result2 = await AuthRepository.signup('user2', 'pass2abc');

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);

      const users = AuthRepository.getAllUsers();
      expect(users).toHaveLength(2);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await AuthRepository.signup('alice', 'password123');
      AuthRepository.logout();
    });

    it('returns a session on successful login', async () => {
      const result = await AuthRepository.login('alice', 'password123');

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.session!.username).toBe('alice');
      expect(result.session!.isAuthenticated).toBe(true);
    });

    it('rejects login with wrong password', async () => {
      const result = await AuthRepository.login('alice', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.session).toBeUndefined();
    });

    it('rejects login with non-existent username', async () => {
      const result = await AuthRepository.login('nonexistent', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.session).toBeUndefined();
    });

    it('persists session to localStorage on login', async () => {
      await AuthRepository.login('alice', 'password123');

      const storedSession = localStorage.getItem(STORAGE_KEYS.session);
      expect(storedSession).not.toBeNull();

      const parsed = JSON.parse(storedSession!);
      expect(parsed.username).toBe('alice');
      expect(parsed.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears the session from localStorage', async () => {
      await AuthRepository.signup('alice', 'password123');

      const sessionBefore = AuthRepository.getSession();
      expect(sessionBefore).not.toBeNull();

      AuthRepository.logout();

      const sessionAfter = AuthRepository.getSession();
      expect(sessionAfter).toBeNull();
    });

    it('removes session key from localStorage', async () => {
      await AuthRepository.signup('alice', 'password123');

      AuthRepository.logout();

      const storedSession = localStorage.getItem(STORAGE_KEYS.session);
      expect(storedSession).toBeNull();
    });
  });

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      const session = AuthRepository.getSession();
      expect(session).toBeNull();
    });

    it('returns the current session after signup', async () => {
      await AuthRepository.signup('alice', 'password123');

      const session = AuthRepository.getSession();
      expect(session).not.toBeNull();
      expect(session!.username).toBe('alice');
      expect(session!.isAuthenticated).toBe(true);
    });

    it('returns the current session after login', async () => {
      await AuthRepository.signup('alice', 'password123');
      AuthRepository.logout();

      await AuthRepository.login('alice', 'password123');

      const session = AuthRepository.getSession();
      expect(session).not.toBeNull();
      expect(session!.username).toBe('alice');
    });

    it('returns null after logout', async () => {
      await AuthRepository.signup('alice', 'password123');
      AuthRepository.logout();

      const session = AuthRepository.getSession();
      expect(session).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('returns empty array when no users exist', () => {
      const users = AuthRepository.getAllUsers();
      expect(users).toEqual([]);
    });

    it('returns all registered users', async () => {
      await AuthRepository.signup('alice', 'pass1abc');
      await AuthRepository.signup('bob', 'pass2abc');

      const users = AuthRepository.getAllUsers();
      expect(users).toHaveLength(2);
      expect(users.map((u) => u.username)).toContain('alice');
      expect(users.map((u) => u.username)).toContain('bob');
    });
  });
});