import React from 'react';
import { BookOpen, Heart, Trophy, BookHeart, User, LogIn, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Navigation Items Config
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/challenge', label: 'Challenge', icon: Trophy },
    { path: '/dua', label: 'Duca', icon: BookHeart },
    { path: '/favorites', label: 'Keydka', icon: Heart },
    { path: '/profile', label: 'Profile', icon: User, isProfile: true },
  ];

  return (
    <>
      {/* --- MOBILE BOTTOM NAVIGATION (Fixed Bottom, Icon Only) --- */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 px-6 py-3 pb-6 safe-area-bottom">
         <div className="flex justify-between items-center">
            {navItems.map((item) => {
               const active = isActive(item.path);
               const Icon = item.icon;
               
               // Special case for Profile if logged out
               if (item.isProfile && !user) {
                  return (
                    <Link 
                      key={item.path}
                      to="/login"
                      className={`p-2 transition-all ${active ? 'text-emerald-600' : 'text-stone-400'}`}
                    >
                       <LogIn className="w-6 h-6" />
                    </Link>
                  )
               }

               return (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className={`relative p-2 transition-all duration-300 ${active ? 'text-emerald-600 -translate-y-2' : 'text-stone-400 hover:text-stone-600'}`}
                  >
                     {/* Active Indicator Dot */}
                     {active && (
                       <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-emerald-600 rounded-full"></span>
                     )}
                     
                     {/* Icon */}
                     {item.isProfile && user?.photoUrl ? (
                         <img src={user.photoUrl} alt="Me" className={`w-7 h-7 rounded-full border-2 ${active ? 'border-emerald-600' : 'border-stone-300'}`} />
                     ) : (
                         <Icon className={`w-6 h-6 ${active && item.path !== '/profile' ? 'fill-current' : ''}`} />
                     )}
                  </Link>
               );
            })}
         </div>
      </div>

      {/* --- DESKTOP FLOATING NAVIGATION (Icon Only Island) --- */}
      <nav className="hidden md:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-emerald-900/95 backdrop-blur-xl text-white px-6 py-3 rounded-full shadow-2xl border border-white/10 flex items-center gap-8 animate-in slide-in-from-top-4 duration-500">
          
          {/* Brand/Home */}
          <Link 
            to="/" 
            className={`p-2 rounded-full transition-all hover:bg-white/10 ${isActive('/') ? 'bg-white/20 text-white' : 'text-emerald-200'}`}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </Link>

          <div className="h-6 w-px bg-white/10"></div>
          
          {/* Main Actions */}
          <div className="flex items-center gap-4">
             <Link 
               to="/challenge" 
               className={`p-3 rounded-full transition-all hover:bg-white/10 hover:-translate-y-1 ${isActive('/challenge') ? 'bg-white text-emerald-900 shadow-lg' : 'text-emerald-100'}`}
               title="Challenge"
             >
                <Trophy className={`w-5 h-5 ${isActive('/challenge') ? 'fill-current' : ''}`} />
             </Link>

             <Link 
               to="/dua" 
               className={`p-3 rounded-full transition-all hover:bg-white/10 hover:-translate-y-1 ${isActive('/dua') ? 'bg-white text-emerald-900 shadow-lg' : 'text-emerald-100'}`}
               title="Duca Notes"
             >
                <BookHeart className="w-5 h-5" />
             </Link>

             <Link 
               to="/favorites" 
               className={`p-3 rounded-full transition-all hover:bg-white/10 hover:-translate-y-1 ${isActive('/favorites') ? 'bg-white text-emerald-900 shadow-lg' : 'text-emerald-100'}`}
               title="Favorites"
             >
                <Heart className={`w-5 h-5 ${isActive('/favorites') ? 'fill-current' : ''}`} />
             </Link>
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          {/* Profile / Login */}
          {user ? (
            <Link 
              to="/profile"
              className={`transition-all hover:scale-110 ${isActive('/profile') ? 'ring-2 ring-white rounded-full' : ''}`}
              title="Profile"
            >
               {user.photoUrl ? (
                  <img src={user.photoUrl} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500" />
               ) : (
                   <div className="w-9 h-9 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-900 font-bold text-xs border-2 border-emerald-500">
                     {user.name.substring(0, 2).toUpperCase()}
                   </div>
               )}
            </Link>
          ) : (
            <Link 
              to="/login"
              className={`p-2 rounded-full transition-all hover:bg-white/10 ${isActive('/login') ? 'bg-white text-emerald-900' : 'text-emerald-100'}`}
              title="Login"
            >
               <LogIn className="w-5 h-5" />
            </Link>
          )}
        </div>
      </nav>

      {/* --- MOBILE TOP BRANDING --- */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-4 h-14 flex items-center justify-center">
         <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-lg font-bold font-arabic text-emerald-900 tracking-wide">Janna</h1>
         </Link>
      </div>
    </>
  );
};

export default Navbar;