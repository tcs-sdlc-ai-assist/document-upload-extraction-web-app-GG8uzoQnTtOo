import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Session } from '@/types';
import * as AuthRepository from '@/repositories/AuthRepository';

interface SessionContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthRepository.AuthResult>;
  signup: (username: string, password: string) => Promise<AuthRepository.AuthResult>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const existingSession = AuthRepository.getSession();
      if (existingSession && existingSession.isAuthenticated) {
        setSession(existingSession);
      }
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AuthRepository.AuthResult> => {
    const result = await AuthRepository.login(username, password);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<AuthRepository.AuthResult> => {
    const result = await AuthRepository.signup(username, password);
    if (result.success && result.session) {
      setSession(result.session);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    AuthRepository.logout();
    setSession(null);
  }, []);

  const isAuthenticated = session !== null && session.isAuthenticated;

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isAuthenticated,
      isLoading,
      login,
      signup,
      logout,
    }),
    [session, isAuthenticated, isLoading, login, signup, logout],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}