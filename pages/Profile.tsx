import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Trophy, BookHeart, Heart, User, Calendar, Crown, Sparkles, Zap, Star } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Stats State
  const [stats, setStats] = useState({
     challengesCompleted: 0,
     duasSaved: 0,
     favoritesCount: 0,
     activeChallenges: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Calculate Stats
    const storedChallenges = JSON.parse(localStorage.getItem('quran_app_challenges') || '[]');
    const storedDuas = JSON.parse(localStorage.getItem('quran_app_duas') || '[]');
    const storedFavorites = JSON.parse(localStorage.getItem('quran_app_favorites') || '[]');
    
    const completed = storedChallenges.reduce((acc: number, curr: any) => acc + (curr.timesCompleted || 0), 0);
    
    setStats({
        challengesCompleted: completed,
        activeChallenges: storedChallenges.length,
        duasSaved: storedDuas.length,
        favoritesCount: storedFavorites.length
    });

  }, [user, navigate]);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-sand-50 pb-32">
       {/* Modern Gradient Cover */}
       <div className="h-64 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-800 relative overflow-hidden rounded-b-[2.5rem] shadow-xl">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
          
          {/* Shine Effects */}
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/20 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-yellow-400/20 blur-3xl rounded-full"></div>

          <div className="absolute bottom-6 right-6">
             <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2 text-white font-bold text-sm shadow-lg">
                <Crown className="w-4 h-4 text-yellow-300 fill-current" />
                Janna Member
             </div>
          </div>
       </div>

       {/* Profile Card Overlay */}
       <div className="px-4 -mt-20 relative z-10 max-w-lg mx-auto">
          <div className="bg-white/80 backdrop-blur-xl border border-white p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center">
             
             {/* Avatar with Emoji Badge */}
             <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-teal-600 shadow-xl">
                    {user.photoUrl ? (
                        <img src={user.photoUrl} alt={user.name} className="w-full h-full rounded-full object-cover border-4 border-white" />
                    ) : (
                        <div className="w-full h-full bg-stone-100 rounded-full flex items-center justify-center text-emerald-800 font-black text-3xl border-4 border-white">
                        {initials}
                        </div>
                    )}
                </div>
                {/* Status Emoji */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-2xl border-2 border-emerald-50 transform hover:scale-110 transition-transform">
                    👑
                </div>
             </div>

             <h1 className="text-2xl font-bold text-stone-800 mb-1 flex items-center gap-2">
                {user.name} 
                <span className="text-blue-500"><Sparkles className="w-4 h-4 fill-current animate-pulse" /></span>
             </h1>
             <p className="text-stone-500 text-sm font-medium mb-6">
                {user.email}
             </p>

             {/* Mini Join Date Badge */}
             <div className="inline-flex items-center gap-2 bg-stone-50 px-4 py-1.5 rounded-full text-xs font-bold text-stone-400 border border-stone-100">
                <Calendar className="w-3 h-3" /> Member since {user.joinedDate}
             </div>
          </div>
       </div>

       {/* Stats Section */}
       <div className="max-w-4xl mx-auto px-4 mt-8">
          <h2 className="text-lg font-bold text-stone-700 mb-4 px-2 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-current" /> Overview
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
             {/* Card 1 */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-amber-100 rounded-full opacity-50 blur-xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center text-amber-600 mb-3 shadow-sm">
                       <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-stone-800 mb-1">{stats.challengesCompleted}</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Challenges Won</div>
                 </div>
             </div>

             {/* Card 2 */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-emerald-100 rounded-full opacity-50 blur-xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 mb-3 shadow-sm">
                       <Star className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-stone-800 mb-1">{stats.activeChallenges}</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Active Goals</div>
                 </div>
             </div>
             
             {/* Card 3 */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-rose-100 rounded-full opacity-50 blur-xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-xl flex items-center justify-center text-rose-500 mb-3 shadow-sm">
                       <Heart className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-stone-800 mb-1">{stats.favoritesCount}</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Favorites</div>
                 </div>
             </div>

             {/* Card 4 */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 relative overflow-hidden group">
                 <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-blue-100 rounded-full opacity-50 blur-xl group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-blue-500 mb-3 shadow-sm">
                       <BookHeart className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-stone-800 mb-1">{stats.duasSaved}</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">My Duas</div>
                 </div>
             </div>
          </div>
       </div>

       {/* Logout Button */}
       <div className="max-w-md mx-auto px-6 mt-10">
          <button 
             onClick={logout}
             className="w-full py-4 rounded-xl border-2 border-stone-100 text-stone-400 font-bold hover:bg-rose-50 hover:border-rose-100 hover:text-rose-500 transition-all flex items-center justify-center gap-2"
          >
             <LogOut className="w-5 h-5" />
             Log Out
          </button>
       </div>
    </div>
  );
};

export default Profile;