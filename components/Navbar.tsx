import React from 'react';
import { BookOpen, Heart, Trophy, BookHeart, User, LogIn, Home, Sprout } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Reusable Logo Component
export const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/30 text-white transform rotate-3 hover:rotate-6 transition-transform">
            <Sprout className="w-6 h-6 fill-current" />
        </div>
        <span className="text-xxl font-bold font-arabic tracking-wide text-slate-800">Janna</span>
    </div>
);

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;
  const isReaderPage = location.pathname === '/reader';

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/challenge', label: 'Challenge', icon: Trophy },
    { path: '/dua', label: 'Duca', icon: BookHeart },
    { path: '/favorites', label: 'Keydka', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <>
      {/* =======================
          MOBILE LAYOUT 
      ======================== */}

      {/* Mobile Top Bar (Branding) - Hidden on Reader */}
      {!isReaderPage && (
          <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
             <Link to="/">
                <Logo />
             </Link>
             {user && (
                 <Link to="/profile">
                     {user.photoUrl ? (
                        <img src={user.photoUrl} alt="Me" className="w-9 h-9 rounded-full border border-slate-200" />
                     ) : (
                        <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
                            {user.name.substring(0, 1)}
                        </div>
                     )}
                 </Link>
             )}
          </div>
      )}

      {/* Mobile Bottom Nav (Floating Dock) - Hidden on Reader */}
      {!isReaderPage && (
          <div className="md:hidden fixed bottom-6 inset-x-4 z-50 pointer-events-none">
             <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl px-2 py-3 flex justify-between items-center max-w-sm mx-auto pointer-events-auto">
                {navItems.map((item) => {
                   const active = isActive(item.path);
                   const Icon = item.icon;
                   
                   // Login icon for profile tab if logged out
                   if (item.isProfile && !user) {
                      return (
                        <Link 
                          key={item.path}
                          to="/login"
                          className={`p-3 rounded-xl transition-all ${active ? 'bg-teal-50 text-teal-600' : 'text-slate-400'}`}
                        >
                           <LogIn className="w-6 h-6" />
                        </Link>
                      )
                   }
    
                   return (
                      <Link 
                        key={item.path}
                        to={item.path}
                        className={`relative p-3 rounded-xl transition-all duration-300 group ${active ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                         {/* Active Indicator Dot */}
                         {active && <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full"></span>}
                         
                         {item.isProfile && user?.photoUrl ? (
                             <img src={user.photoUrl} alt="Me" className={`w-6 h-6 rounded-full object-cover border-2 ${active ? 'border-teal-500' : 'border-slate-200'}`} />
                         ) : (
                             <Icon className={`w-6 h-6 ${active && item.path !== '/profile' ? 'fill-current transform -translate-y-1' : ''} transition-transform`} />
                         )}
                      </Link>
                   );
                })}
             </div>
          </div>
      )}


      {/* =======================
          DESKTOP LAYOUT (WEBSITE MENU)
      ======================== */}
      
      {/* Full Width Sticky Header */}
      <nav className={`hidden md:flex fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${isReaderPage ? 'bg-white border-slate-200' : 'bg-white/80 backdrop-blur-xl border-white/20'}`}>
         <div className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
            
            {/* Left: Logo */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
               <Logo />
            </Link>

            {/* Center: Navigation Links */}
            {!isReaderPage && (
              <div className="flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                {navItems.slice(0, 4).map((item) => { // Skip profile here, put it on right
                    const active = isActive(item.path);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all duration-300 ${
                          active 
                            ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-100' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
                        {item.label}
                      </Link>
                    )
                })}
              </div>
            )}

            {/* Right: Auth / Profile */}
            <div>
              {user ? (
                 <Link 
                   to="/profile" 
                   className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white border border-slate-200 hover:border-teal-200 hover:shadow-md transition-all group"
                 >
                    {user.photoUrl ? (
                       <img src={user.photoUrl} alt="Me" className="w-9 h-9 rounded-full border border-slate-100 group-hover:scale-105 transition-transform" />
                    ) : (
                       <div className="w-9 h-9 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-xs">
                          {user.name.substring(0, 1)}
                       </div>
                    )}
                    <div className="text-left hidden lg:block">
                       <span className="block text-xs font-bold text-slate-700">{user.name}</span>
                       <span className="block text-[10px] text-slate-400">View Profile</span>
                    </div>
                 </Link>
              ) : (
                 <Link 
                   to="/login"
                   className="px-6 py-2.5 bg-teal-600 text-white rounded-full font-bold shadow-lg shadow-teal-600/20 hover:bg-teal-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                 >
                    <LogIn className="w-4 h-4" />
                    Login
                 </Link>
              )}
            </div>
         </div>
      </nav>
    </>
  );
};

export default Navbar;