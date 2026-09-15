import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  const location = useLocation();

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-8 duration-700 ease-spring">
      {/* Outer Shell - Double Bezel */}
      <div className="bg-white/5 backdrop-blur-2xl ring-1 ring-white/10 p-1.5 rounded-full shadow-2xl">
        {/* Inner Core */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-black/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] rounded-[calc(9999px-0.375rem)] px-4 py-2">
          <Link to="/" className="flex items-center space-x-2 mr-4 group">
            <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center ring-1 ring-brand-500/30 group-hover:bg-brand-500/20 transition-all duration-500">
              <ShieldCheck className="h-4 w-4 text-brand-400" strokeWidth={1.5} />
            </div>
            <span className="text-sm font-bold tracking-wide text-white">
              VAIDYA<span className="text-brand-400">SETU</span>
            </span>
          </Link>
          
          <nav className="flex items-center space-x-1">
            <Link 
              to="/wizard" 
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-500 ${location.pathname === '/wizard' ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Formulation Classifier
            </Link>
            <Link 
              to="/chat" 
              className={`px-4 py-2 text-xs font-medium rounded-full transition-all duration-500 ${location.pathname === '/chat' ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
            >
              Legal Assistant
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
