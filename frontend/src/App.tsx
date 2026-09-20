import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingView from './components/LandingView';
import { LoginView, SignupView } from './components/AuthViews';
import OnboardingView from './components/OnboardingView';
import HomeDashboard from './components/HomeDashboard';
import WizardView from './components/WizardView';
import ChatView from './components/ChatView';
import RegulatoryMapView from './components/RegulatoryMapView';
import UpdatesView from './components/UpdatesView';
import SourcesView from './components/SourcesView';
import { AppProvider } from './context/AppContext';
import { ShaderBackground } from './components/shared/ShaderBackground';

function LayoutShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/onboarding';
  const isChatPage = location.pathname === '/ask' || location.pathname === '/chat';

  return (
    <div className={`relative ${isChatPage ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen'} flex flex-col bg-[#F7F3EB] text-forest-black antialiased selection:bg-terracotta/15 selection:text-terracotta musky-theme overflow-x-hidden`}>
      <ShaderBackground />
      <Header />
      <main className={`relative z-10 flex-1 w-full ${isChatPage ? 'mt-16 sm:mt-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden' : 'pt-20 sm:pt-24'}`}>
        {children}
      </main>
      {!isAuthPage && !isChatPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <LayoutShell>
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
            <Route path="/onboarding" element={<OnboardingView />} />
            <Route path="/home" element={<HomeDashboard />} />
            <Route path="/assess" element={<WizardView />} />
            <Route path="/wizard" element={<WizardView />} />
            <Route path="/ask" element={<ChatView />} />
            <Route path="/chat" element={<ChatView />} />
            <Route path="/regulatory-map" element={<RegulatoryMapView />} />
            <Route path="/updates" element={<UpdatesView />} />
            <Route path="/sources" element={<SourcesView />} />
            {/* Backward-compatibility redirects for removed non-essential pages */}
            <Route path="/cases" element={<Navigate to="/home" replace />} />
            <Route path="/cases/*" element={<Navigate to="/home" replace />} />
            <Route path="/quick-tools" element={<Navigate to="/regulatory-map" replace />} />
            <Route path="/quick-tools/*" element={<Navigate to="/regulatory-map" replace />} />
            {/* Fallback */}
            <Route path="*" element={<LandingView />} />
          </Routes>
        </LayoutShell>
      </Router>
    </AppProvider>
  );
}

export default App;
