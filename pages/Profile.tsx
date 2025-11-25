
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight, User as UserIcon, Bell, Shield, Heart, Trophy, Book, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
     challenges: 0,
     duas: 0,
     favorites: 0
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const storedChallenges = JSON.parse(localStorage.getItem('quran_app_challenges') || '[]');
    const storedDuas = JSON.parse(localStorage.getItem('quran_app_duas') || '[]');
    const storedFavorites = JSON.parse(localStorage.getItem('quran_app_favorites') || '[]');
    
    setStats({
        challenges: storedChallenges.length,
        duas: storedDuas.length,
        favorites: storedFavorites.length
    });
  }, [user, navigate]);

  if (!user) return null;

  const initials = user.name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-stone-50 pb-32 pt-24 md:pt-10">
       <div className="max-w-xl mx-auto px-4">
          
          {/* 1. CLEAN HEADER (No Gradient/Box) */}
          <div className="flex flex-col items-center mb-10">
             <div className="w-28 h-28 rounded-full bg-white p-1 shadow-lg mb-4">
                 {user.photoUrl ? (
                    <img src={user.photoUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-stone-100 rounded-full flex items-center justify-center text-3xl font-bold text-stone-400">
                       {initials}
                    </div>
                 )}
             </div>
             <h1 className="text-2xl font-bold text-stone-900">{user.name}</h1>
             <p className="text-stone-500 font-medium">{user.email}</p>
          </div>

          {/* 2. STATS ROW (Simple & Clean) */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex justify-between items-center mb-8">
             <div className="text-center flex-1 border-r border-stone-100">
                <div className="text-2xl font-bold text-stone-800">{stats.challenges}</div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Challenges</div>
             </div>
             <div className="text-center flex-1 border-r border-stone-100">
                <div className="text-2xl font-bold text-stone-800">{stats.favorites}</div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Favorites</div>
             </div>
             <div className="text-center flex-1">
                <div className="text-2xl font-bold text-stone-800">{stats.duas}</div>
                <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Duas</div>
             </div>
          </div>

          {/* 3. SETTINGS LIST (iOS Style) */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
             
             {/* Account Item */}
             <div className="p-4 flex items-center justify-between border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <UserIcon className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-stone-700">Personal Info</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-50" />
             </div>

             {/* Notifications */}
             <div className="p-4 flex items-center justify-between border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Bell className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-stone-700">Notifications</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-50" />
             </div>

             {/* Privacy */}
             <div className="p-4 flex items-center justify-between border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Shield className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-stone-700">Privacy & Security</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-50" />
             </div>
             
             {/* General Settings */}
             <div className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Settings className="w-5 h-5" />
                   </div>
                   <span className="font-medium text-stone-700">App Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300 group-hover:text-stone-50" />
             </div>

          </div>

          {/* 4. LOGOUT BUTTON */}
          <button 
             onClick={logout}
             className="w-full mt-8 bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-colors"
          >
             <LogOut className="w-5 h-5" />
             Sign Out
          </button>

          <p className="text-center text-xs text-stone-300 mt-8">Janna App v1.0.2</p>
       </div>
    </div>
  );
};

export default Profile;
