import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  BookOpen,
  Sliders,
  LogOut,
  LogIn,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, demoMode, user, isAuthenticated, logout } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { path: '/home', label: 'Home' },
    { path: '/assess', label: 'Assess Product' },
    { path: '/ask', label: 'Ask Sahayak' },
    { path: '/regulatory-map', label: 'Regulatory Map' },
    { path: '/updates', label: 'Updates', badge: '3' },
    { path: '/sources', label: 'Sources' },
  ];

  const isActive = (path: string) => {
    if (path === '/home' && location.pathname === '/home') return true;
    if (path !== '/home' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const displayName = user?.full_name || profile.name;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F7F3EB]/80 backdrop-blur-xl border-b border-greige/80 shadow-warm-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cream border border-greige/80 flex items-center justify-center p-1.5 shadow-warm-sm group-hover:scale-105 transition-all">
              <img src="/logo-dravya.png" alt="Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-forest">
                  Vaidya<span className="text-terracotta italic font-normal">Setu</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-forest/8 text-forest border border-forest/15">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-forest-muted hidden sm:block">
                All India Institute of Ayurveda • IP Facilitation
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? 'glass-pill text-forest font-semibold'
                      : 'text-forest/70 hover:text-forest hover:bg-white/50'
                  }`}
                >
                  {link.label}
                  {link.badge && (
                    <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-terracotta text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Cluster - Profile / Sign In */}
          <div className="flex items-center gap-2 shrink-0">
            {!isAuthenticated && !demoMode ? (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-forest text-cream text-xs font-semibold hover:bg-forest/90 transition-all shadow-warm-sm flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-cream" />
                <span>Sign In</span>
              </Link>
            ) : (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-3 rounded-full bg-white/55 hover:bg-white/80 backdrop-blur-md border border-white/85 transition-all shadow-[0_2px_6px_rgba(40,61,52,0.04),inset_0_1px_1px_rgba(255,255,255,0.9)] shrink-0 whitespace-nowrap"
                >
                  <div className="w-7 h-7 rounded-full bg-terracotta text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                    {initials || 'VS'}
                  </div>
                  <span className="text-xs font-medium text-forest hidden md:inline max-w-[120px] truncate">
                    {displayName.replace('Dr. ', '')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-forest/60" />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#FAF7F2]/95 backdrop-blur-2xl border border-white/90 shadow-[0_16px_40px_rgba(40,61,52,0.12),inset_0_1px_1px_rgba(255,255,255,0.9)] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="border-b border-greige/50 pb-3 mb-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-forest truncate">{displayName}</p>
                        {isAuthenticated && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                            Live
                          </span>
                        )}
                      </div>
                      {user?.email && (
                        <p className="text-[11px] text-forest-muted truncate mt-0.5">{user.email}</p>
                      )}
                      <p className="text-[11px] text-terracotta font-medium mt-1">
                        {profile.userType}
                      </p>
                    </div>

                    <div className="space-y-1 mb-3">
                      <p className="text-[10px] uppercase font-semibold text-forest-muted tracking-wider mb-1">
                        Target Regulatory Goals
                      </p>
                      {profile.goals.map((g, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[11px] text-forest">
                          <Check className="w-3 h-3 text-forest shrink-0" />
                          <span className="truncate">{g}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-greige/50 pt-2 space-y-1">
                      <Link
                        to="/onboarding"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-2 py-1.5 text-xs text-forest hover:bg-white/60 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Sliders className="w-3.5 h-3.5 text-forest/60" />
                        <span>Edit Onboarding Profile</span>
                      </Link>
                      <Link
                        to="/sources"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full text-left px-2 py-1.5 text-xs text-forest hover:bg-white/60 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-forest/60" />
                        <span>Statutory Coverage</span>
                      </Link>
                      <button
                        type="button"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          navigate('/login');
                        }}
                        className="w-full text-left px-2 py-1.5 text-xs text-ayush-danger hover:bg-ayush-danger/10 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-ayush-danger" />
                        <span>Log out / Switch User</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile secondary navigation bar */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pt-2 pb-2.5 border-t border-greige/30 no-scrollbar">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all ${
                isActive(link.path)
                  ? 'glass-pill text-forest font-semibold'
                  : 'text-forest/70 hover:text-forest hover:bg-white/40'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
