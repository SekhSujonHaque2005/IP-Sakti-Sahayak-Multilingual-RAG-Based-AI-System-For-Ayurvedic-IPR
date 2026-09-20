import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Case, OnboardingProfile } from '../types/contract';
import { INITIAL_CASES } from '../mocks/fixtures';
import type { AuthUser } from '../api';
import {
  loginUser,
  signupUser,
  loginWithGoogle,
  getCurrentUser,
  logoutUser,
  getStoredToken,
} from '../api';

interface AppContextType {
  jurisdiction: 'IN' | 'INTL';
  setJurisdiction: (j: 'IN' | 'INTL') => void;
  language: string;
  setLanguage: (lang: string) => void;
  profile: OnboardingProfile;
  setProfile: (p: OnboardingProfile) => void;
  cases: Case[];
  addCase: (newCase: Case) => void;
  updateCaseAction: (caseId: string, actionId: string, completed: boolean) => void;
  requestExpertReview: (caseId: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_PROFILE: OnboardingProfile = {
  name: 'Dr. Charu Malhotra',
  userType: 'Formulator / Innovator',
  goals: [
    'Protect a formulation (patents/GI/trademark)',
    'Check ABS / biodiversity compliance',
    'Understand classical vs proprietary vs new-drug status',
  ],
  language: 'English',
  guidancePreference: 'balanced',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jurisdiction, setJurisdiction] = useState<'IN' | 'INTL'>('IN');
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [profile, setProfileState] = useState<OnboardingProfile>(() => {
    const saved = localStorage.getItem('vaidya_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return DEFAULT_PROFILE;
  });

  const [language, setLanguageState] = useState<string>(() => {
    const savedLang = localStorage.getItem('vaidya_language');
    if (savedLang) return savedLang;
    const savedProfile = localStorage.getItem('vaidya_profile');
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        if (p.language) return p.language;
      } catch (e) { /* ignore */ }
    }
    return 'English';
  });

  // Rehydrate session from stored JWT on initial mount
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const stored = getStoredToken();
      if (!stored) {
        if (mounted) setAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setToken(stored);
          if (currentUser.full_name) {
            setProfileState(prev => ({
              ...prev,
              name: currentUser.full_name || prev.name,
            }));
          }
        }
      } catch (err) {
        // Token expired or invalid
        localStorage.removeItem('vaidya_token');
        if (mounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    setToken(res.access_token);
    setDemoMode(false);
    if (res.user.full_name) {
      setProfileState(prev => ({
        ...prev,
        name: res.user.full_name || prev.name,
      }));
    }
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    const res = await signupUser(email, password, fullName);
    setUser(res.user);
    setToken(res.access_token);
    setDemoMode(false);
    if (fullName) {
      setProfileState(prev => ({
        ...prev,
        name: fullName,
      }));
    }
  };

  const googleLogin = async (idToken: string) => {
    const res = await loginWithGoogle(idToken);
    setUser(res.user);
    setToken(res.access_token);
    setDemoMode(false);
    if (res.user.full_name) {
      setProfileState(prev => ({
        ...prev,
        name: res.user.full_name || prev.name,
      }));
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    setDemoMode(false);
  };

  const setLanguage = (newLang: string) => {
    setLanguageState(newLang);
    localStorage.setItem('vaidya_language', newLang);
    setProfileState(prev => ({ ...prev, language: newLang }));
  };

  const [cases, setCases] = useState<Case[]>(() => {
    const saved = localStorage.getItem('vaidya_cases');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_CASES;
  });

  useEffect(() => {
    localStorage.setItem('vaidya_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vaidya_cases', JSON.stringify(cases));
  }, [cases]);

  const setProfile = (newProfile: OnboardingProfile) => {
    setProfileState(newProfile);
    if (newProfile.language) {
      setLanguageState(newProfile.language);
      localStorage.setItem('vaidya_language', newProfile.language);
    }
  };

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCaseAction = (caseId: string, actionId: string, completed: boolean) => {
    setCases(prev =>
      prev.map(c => {
        if (c.id !== caseId) return c;
        const updatedPlan = c.actionPlan.map(a =>
          a.id === actionId ? { ...a, completed } : a
        );
        return { ...c, actionPlan: updatedPlan, updatedAt: new Date().toISOString().split('T')[0] };
      })
    );
  };

  const requestExpertReview = (caseId: string) => {
    setCases(prev =>
      prev.map(c =>
        c.id === caseId ? { ...c, expertReviewRequested: true, status: 'review' } : c
      )
    );
  };

  const isAuthenticated = !!user || !!token;

  return (
    <AppContext.Provider
      value={{
        jurisdiction,
        setJurisdiction,
        language,
        setLanguage,
        profile,
        setProfile,
        cases,
        addCase,
        updateCaseAction,
        requestExpertReview,
        demoMode,
        setDemoMode,
        user,
        token,
        isAuthenticated,
        authLoading,
        login,
        signup,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
