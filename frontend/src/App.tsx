import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingView from './components/LandingView';
import WizardView from './components/WizardView';
import ChatView from './components/ChatView';
import Header from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-[100dvh] bg-[#050505] text-white font-sans antialiased overflow-x-hidden">
        {/* Subtle radial mesh gradient background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50 transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen opacity-30 transform -translate-x-1/4 translate-y-1/4"></div>
          {/* Subtle noise overlay for haptic depth */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
        </div>

        <div className="relative z-10">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
            <Routes>
              <Route path="/" element={<LandingView />} />
              <Route path="/wizard" element={<WizardView />} />
              <Route path="/chat" element={<ChatView />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
