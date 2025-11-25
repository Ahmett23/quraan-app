import React, { useState, useEffect, useMemo } from 'react';
import { useGoals, Goal } from '../hooks/useGoals';
import { getChapters } from '../services/api';
import { Chapter } from '../types';
import { Flame, Target, Calendar, CheckCircle2, Trash2, Plus, Play, Sparkles, BookOpen, Search, ArrowRight, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Goals: React.FC = () => {
  const { goals, streak, addGoal, deleteGoal, markDailyProgress } = useGoals();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [goalType, setGoalType] = useState<'KHATMAH' | 'SURAH'>('SURAH');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [duration, setDuration] = useState<number>(7);
  const [surahSearch, setSurahSearch] = useState('');

  useEffect(() => {
    const loadChapters = async () => {
      const data = await getChapters();
      setChapters(data);
      setLoading(false);
    };
    loadChapters();
  }, []);

  const handleCreateGoal = () => {
    let title = "Khatmul Quran";
    let totalPages = 604;
    let startPageNumber = 1;
    let targetId = undefined;

    if (goalType === 'SURAH') {
      const surah = chapters.find(c => c.id === selectedSurahId);
      if (surah) {
        title = `Surat ${surah.name_simple}`;
        // Calculate pages based on API data (pages is [start, end])
        startPageNumber = surah.pages[0];
        totalPages = (surah.pages[1] - surah.pages[0]) + 1;
        targetId = surah.id;
      }
    }

    addGoal(goalType, title, totalPages, startPageNumber, duration, targetId);
    setShowForm(false);
    setSurahSearch('');
  };

  const getPagesPerDay = () => {
     if (goalType === 'KHATMAH') {
         return Math.ceil(604 / duration);
     }
     const surah = chapters.find(c => c.id === selectedSurahId);
     if (!surah) return 0;
     const surahPages = (surah.pages[1] - surah.pages[0]) + 1;
     return Math.ceil(surahPages / duration);
  };

  const filteredSurahs = useMemo(() => {
    return chapters.filter(c => 
      c.name_simple.toLowerCase().includes(surahSearch.toLowerCase()) || 
      c.id.toString().includes(surahSearch)
    );
  }, [chapters, surahSearch]);

  const navigateToReader = (goal: Goal) => {
      // Calculate current page: Start + Completed
      // Ensure we don't go past the end
      const pageToRead = Math.min(goal.startPageNumber + goal.completedPages, goal.startPageNumber + goal.totalPages - 1);
      navigate(`/reader?page=${pageToRead}`);
  };

  return (
    <div className="min-h-screen bg-sand-50 pb-32">
      {/* Modern Gradient Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white pt-12 pb-24 px-4 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Target className="w-80 h-80 transform rotate-12" />
         </div>
         <div className="absolute -left-10 top-10 w-40 h-40 bg-emerald-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse pointer-events-none"></div>

         <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-bold mb-2 tracking-tight">Habit Tracker</h2>
                    <p className="text-emerald-100 text-lg opacity-90 max-w-lg">
                        La soco oo joogtee akhriskaaga Quraanka maalin walba.
                    </p>
                </div>

                {/* Streak Card */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                    <div className={`p-4 rounded-2xl shadow-inner ${streak > 0 ? 'bg-orange-500 text-white' : 'bg-stone-800/50 text-stone-400'}`}>
                        <Flame className={`w-8 h-8 ${streak > 0 ? 'animate-bounce' : ''}`} />
                    </div>
                    <div>
                        <p className="text-xs text-emerald-200 uppercase tracking-widest font-bold">Streak</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{streak}</span>
                            <span className="text-sm font-medium opacity-80">Maalmood</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-20">
        
        {/* Create Goal Form */}
        {showForm && (
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-100 animate-in fade-in slide-in-from-bottom-5 duration-300 mb-8">
                <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-bold text-stone-800 flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-emerald-500" />
                        Abuur Habit Cusub
                     </h3>
                     <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-600">
                         <span className="sr-only">Close</span>
                         <Plus className="w-6 h-6 rotate-45" />
                     </button>
                </div>
                
                <div className="space-y-8">
                    {/* Goal Type */}
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">Dooro Nooca</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setGoalType('SURAH')}
                                className={`group relative overflow-hidden py-4 px-4 rounded-xl border-2 transition-all text-left ${goalType === 'SURAH' ? 'border-emerald-500 bg-emerald-50' : 'border-stone-100 hover:border-emerald-200 bg-white'}`}
                            >
                                <div className={`mb-2 w-8 h-8 rounded-full flex items-center justify-center ${goalType === 'SURAH' ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <span className={`block font-bold ${goalType === 'SURAH' ? 'text-emerald-900' : 'text-stone-600'}`}>Surad Gaar ah</span>
                            </button>

                            <button 
                                onClick={() => setGoalType('KHATMAH')}
                                className={`group relative overflow-hidden py-4 px-4 rounded-xl border-2 transition-all text-left ${goalType === 'KHATMAH' ? 'border-purple-500 bg-purple-50' : 'border-stone-100 hover:border-purple-200 bg-white'}`}
                            >
                                <div className={`mb-2 w-8 h-8 rounded-full flex items-center justify-center ${goalType === 'KHATMAH' ? 'bg-purple-500 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    <Target className="w-4 h-4" />
                                </div>
                                <span className={`block font-bold ${goalType === 'KHATMAH' ? 'text-purple-900' : 'text-stone-600'}`}>Khatmah</span>
                            </button>
                        </div>
                    </div>

                    {/* Surah Selection */}
                    {goalType === 'SURAH' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">Dooro Surada</label>
                            {loading ? (
                                <div className="h-12 bg-stone-100 rounded-xl animate-pulse"></div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-5 h-5 text-stone-400" />
                                        <input 
                                            type="text"
                                            placeholder="Raadi Surah..."
                                            value={surahSearch}
                                            onChange={(e) => setSurahSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="max-h-48 overflow-y-auto border border-stone-100 rounded-xl bg-white shadow-sm">
                                        {filteredSurahs.map(chapter => (
                                            <div 
                                                key={chapter.id}
                                                onClick={() => setSelectedSurahId(chapter.id)}
                                                className={`px-4 py-3 cursor-pointer flex justify-between items-center transition-colors ${selectedSurahId === chapter.id ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-stone-50'}`}
                                            >
                                                <span className="font-medium">{chapter.id}. {chapter.name_simple}</span>
                                                <span className="text-xs text-stone-400">{chapter.verses_count} Ayahs</span>
                                            </div>
                                        ))}
                                        {filteredSurahs.length === 0 && (
                                            <div className="p-4 text-center text-stone-400 text-sm">Lama helin surad.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Duration Slider */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                             <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider">Mudada (Maalmo)</label>
                             <div className="flex gap-2">
                                <button onClick={() => setDuration(7)} className="px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors">7 Maalmood</button>
                                <button onClick={() => setDuration(30)} className="px-3 py-1 text-xs font-bold bg-stone-100 text-stone-600 rounded-full hover:bg-stone-200 transition-colors">30 Maalmood</button>
                             </div>
                        </div>
                        
                        <div className="bg-stone-50 p-6 rounded-xl border border-stone-100">
                             <div className="flex items-center gap-6">
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="60" 
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                                />
                                <div className="min-w-[80px] text-center bg-white px-2 py-1 rounded shadow-sm border border-stone-100">
                                    <span className="block text-xl font-bold text-emerald-600">{duration}</span>
                                    <span className="text-[10px] text-stone-400 font-bold uppercase">Maalmood</span>
                                </div>
                             </div>
                             
                             <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center text-sm">
                                <span className="text-stone-500">Target-kaaga:</span>
                                <span className="font-bold text-stone-800 bg-white px-3 py-1 rounded border border-stone-200 shadow-sm">
                                    {getPagesPerDay()} Pages / day
                                </span>
                             </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button 
                            onClick={() => setShowForm(false)}
                            className="flex-1 py-3 text-stone-500 hover:text-stone-800 font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleCreateGoal}
                            className="flex-[2] py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-600/30 font-bold flex items-center justify-center text-lg"
                        >
                            <Target className="w-5 h-5 mr-2" />
                            Bilow Habit-ka
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Active Goals Grid */}
        <div className="grid gap-6">
            {goals.filter(g => !g.isCompleted).map(goal => (
                <div key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                    {/* Background Progress Tint */}
                     <div 
                        className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${goal.type === 'KHATMAH' ? 'bg-purple-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${(goal.completedPages / goal.totalPages) * 100}%` }}
                    ></div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Left: Info */}
                        <div className="flex-1 z-10">
                            <div className="flex items-center gap-3 mb-3">
                               <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border ${goal.type === 'KHATMAH' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                                  {goal.type === 'KHATMAH' ? 'Khatmah' : 'Surah'}
                               </span>
                               <span className="text-xs text-stone-400 font-medium flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {goal.durationDays} Maalmood
                               </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-stone-800 mb-1">{goal.title}</h3>
                            <p className="text-stone-400 text-sm mb-6">
                                Maalin walba: <span className="text-stone-600 font-semibold">{goal.dailyTargetPages} pages</span>
                            </p>
                            
                            {/* Detailed Progress Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                                    <span className="text-xs text-stone-400 block mb-1">Completed</span>
                                    <span className="font-bold text-stone-700">{goal.completedPages}</span>
                                    <span className="text-xs text-stone-400"> / {goal.totalPages}</span>
                                </div>
                                <div className="bg-stone-50 p-2 rounded-lg border border-stone-100">
                                    <span className="text-xs text-stone-400 block mb-1">Left</span>
                                    <span className="font-bold text-stone-700">{goal.totalPages - goal.completedPages}</span>
                                    <span className="text-xs text-stone-400"> pages</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col justify-center gap-3 md:border-l md:border-stone-100 md:pl-6 md:w-48 z-10">
                            
                            {/* Read Button */}
                            <button 
                                onClick={() => navigateToReader(goal)}
                                className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Sii wad
                            </button>

                            {/* Mark Progress Button */}
                            <button 
                                onClick={() => markDailyProgress(goal.id)}
                                disabled={goal.lastProgressDate === new Date().toISOString().split('T')[0]}
                                className={`
                                    w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all
                                    ${goal.lastProgressDate === new Date().toISOString().split('T')[0] 
                                        ? 'bg-stone-100 text-stone-400 cursor-default' 
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95'}
                                `}
                            >
                                {goal.lastProgressDate === new Date().toISOString().split('T')[0] ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Done
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-5 h-5" />
                                        Mark Done
                                    </>
                                )}
                            </button>
                            
                             <button 
                                onClick={() => deleteGoal(goal.id)}
                                className="flex items-center justify-center gap-2 p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors text-xs"
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Empty State */}
            {goals.length === 0 && !showForm && (
                <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-stone-300">
                    <div className="bg-gradient-to-tr from-emerald-100 to-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <Trophy className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-800 mb-3">Bilow Habit Tracker Maanta!</h3>
                    <p className="text-stone-500 mb-8 max-w-sm mx-auto leading-relaxed">
                        Quraanku waa nuur. Sameyso jadwal kuu gaar ah si aad u joogteyso akhriska maalin walba.
                    </p>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 hover:shadow-2xl hover:-translate-y-1 font-bold text-lg"
                    >
                        <Plus className="w-6 h-6 mr-2" /> Sameyso Habit
                    </button>
                </div>
            )}
        </div>
        
        {/* Floating Add Button */}
        {goals.length > 0 && !showForm && (
            <div className="fixed bottom-24 right-6 md:right-12 z-30 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-300">
                <button 
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-3 bg-stone-900 text-white pl-5 pr-6 py-4 rounded-full shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95 group"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="font-bold text-lg">Habit Cusub</span>
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default Goals;