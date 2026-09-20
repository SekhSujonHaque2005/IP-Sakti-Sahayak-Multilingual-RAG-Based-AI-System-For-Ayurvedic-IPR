import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          prompt: (momentListener?: (moment: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  onSuccess: (idToken: string) => Promise<void>;
  onError: (errorMessage: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  mode = 'signin',
  onSuccess,
  onError,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isGsiReady, setIsGsiReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const clientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    '883031480992-0tonv56j5i2t3aojdbc9iqd2fp7v9qh1.apps.googleusercontent.com';

  useEffect(() => {
    let checkTimer: any = null;
    let attempts = 0;
    const maxAttempts = 30; // check for up to ~6 seconds

    const setupGsi = () => {
      if (window.google?.accounts?.id && containerRef.current) {
        setIsGsiReady(true);
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response: { credential?: string }) => {
              if (response?.credential) {
                try {
                  setIsProcessing(true);
                  await onSuccess(response.credential);
                } catch (err: any) {
                  onError(err.message || 'Google authentication failed. Please try again.');
                } finally {
                  setIsProcessing(false);
                }
              } else {
                onError('No credential received from Google.');
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          // Clear any previous rendered button elements
          containerRef.current.innerHTML = '';

          window.google.accounts.id.renderButton(containerRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 340,
          });
        } catch (e: any) {
          console.error('Failed to initialize Google Identity Services:', e);
        }
        return true;
      }
      return false;
    };

    if (!setupGsi()) {
      checkTimer = setInterval(() => {
        attempts++;
        if (setupGsi() || attempts >= maxAttempts) {
          clearInterval(checkTimer);
        }
      }, 200);
    }

    return () => {
      if (checkTimer) clearInterval(checkTimer);
    };
  }, [clientId, mode, onSuccess, onError]);

  const handleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      onError('Google Sign-In is still loading or blocked by browser privacy extensions. Please verify your connection.');
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative min-h-[44px]">
      {/* Official GIS Rendered Container */}
      <div
        ref={containerRef}
        className={`w-full flex justify-center ${!isGsiReady ? 'hidden' : ''} ${
          disabled || isProcessing ? 'pointer-events-none opacity-60' : ''
        }`}
      />

      {/* Fallback button if GIS script hasn't rendered yet or is delayed */}
      {!isGsiReady && (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={disabled || isProcessing}
          className="w-full max-w-[340px] flex items-center justify-center gap-3 px-4 py-2.5 rounded-full border border-greige/90 bg-white hover:bg-cream/40 text-forest text-xs font-semibold shadow-warm-sm transition-all duration-200"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
        </button>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] rounded-full flex items-center justify-center gap-2 text-xs font-semibold text-forest shadow-warm-sm">
          <Loader2 className="w-4 h-4 animate-spin text-terracotta" />
          <span>Authenticating with Google...</span>
        </div>
      )}
    </div>
  );
};
