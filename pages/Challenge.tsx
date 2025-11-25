import React, { useState, useEffect, useMemo } from 'react';
import { Check, Lock, Trophy, ArrowRight, BookOpen, Target, Calendar, Plus, Search, Sparkles, LayoutGrid, ArrowLeft, Trash2, PartyPopper, Heart, AlertTriangle, RotateCcw, Dumbbell, X, Clock, Bot } from 'lucide-react';
import { getChapters } from '../services/api';
import { Chapter } from '../types';

// --- Types ---

// 1. Quran Challenge Types
interface ChallengeConfig {
  id: string;
  type: 'ALL' | 'SURAH';
  title: string; 
  targetSurah?: Chapter; 
  totalPages: number;
  startPage: number;
  endPage: number;
  duration: number;
  completedDays: number[]; // Array of day indices (0-based)
  startDate: string;
  timesCompleted: number; 
}

// 2. Habit Tracker Types
interface HabitChallengeConfig {
  id: string;
  title: string;
  duration: number;
  habits: string[]; // List of habit names e.g. ["Gym", "Quran", "Water"]
  // Map of dayIndex -> array of completed habit INDICES for that day
  // e.g. { 0: [0, 1], 1: [0] }
  progress: Record<number, number[]>; 
  startDate: string;
  timesCompleted: number;
}

const Challenge: React.FC = () => {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<'QURAN' | 'HABIT'>('QURAN');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Quran Data
  const [challenges, setChallenges] = useState<ChallengeConfig[]>([]);
  
  // Habit Data
  const [habitChallenges, setHabitChallenges] = useState<HabitChallengeConfig[]>([]);

  // Navigation / Mode State
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null); // Works for both types
  const [isCreating, setIsCreating] = useState(false);
  
  // UI State
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // --- Habit Tracking Specific UI State ---
  const [selectedDayForHabit, setSelectedDayForHabit] = useState<number | null>(null); // For opening day modal

  // --- Creation Form State (Shared & Specific) ---
  // Quran Form
  const [quranType, setQuranType] = useState<'ALL' | 'SURAH'>('SURAH');
  const [quranSurahId, setQuranSurahId] = useState<number>(1);
  const [customDuration, setCustomDuration] = useState<number>(30);
  const [surahSearch, setSurahSearch] = useState('');
  
  // Habit Form
  const [habitTitle, setHabitTitle] = useState('');
  const [habitList, setHabitList] = useState<string[]>([]);
  const [tempHabitInput, setTempHabitInput] = useState('');

  // --- Init ---
  useEffect(() => {
    const init = async () => {
      const data = await getChapters();
      setChapters(data);
      setLoading(false);

      // Load Quran Challenges
      const storedQuran = localStorage.getItem('quran_app_challenges');
      if (storedQuran) {
        setChallenges(JSON.parse(storedQuran));
      }

      // Load Habit Challenges
      const storedHabits = localStorage.getItem('quran_app_habit_challenges');
      if (storedHabits) {
        setHabitChallenges(JSON.parse(storedHabits));
      }
    };
    init();
  }, []);

  // --- Persistence Helpers ---
  const saveQuranChallenges = (data: ChallengeConfig[]) => {
    setChallenges(data);
    localStorage.setItem('quran_app_challenges', JSON.stringify(data));
  };

  const saveHabitChallenges = (data: HabitChallengeConfig[]) => {
    setHabitChallenges(data);
    localStorage.setItem('quran_app_habit_challenges', JSON.stringify(data));
  };

  // --- Creation Logic ---

  const handleAddHabitItem = () => {
    if (tempHabitInput.trim()) {
      setHabitList([...habitList, tempHabitInput.trim()]);
      setTempHabitInput('');
    }
  };

  const handleRemoveHabitItem = (index: number) => {
    setHabitList(habitList.filter((_, i) => i !== index));
  };

  const createChallenge = () => {
    const durationVal = Number(customDuration) || 30;

    if (activeTab === 'QURAN') {
      // Create Quran Challenge
      let totalPages = 604;
      let startPage = 1;
      let endPage = 604;
      let targetSurah: Chapter | undefined;
      let title = "Khatmul Quran";

      if (quranType === 'SURAH') {
        targetSurah = chapters.find(c => c.id === quranSurahId);
        if (targetSurah) {
          startPage = targetSurah.pages[0];
          endPage = targetSurah.pages[1];
          totalPages = (endPage - startPage) + 1;
          title = `Surat ${targetSurah.name_simple}`;
        }
      }

      const newC: ChallengeConfig = {
        id: 'q-' + Date.now(),
        type: quranType,
        title,
        targetSurah,
        totalPages,
        startPage,
        endPage,
        duration: durationVal,
        completedDays: [],
        startDate: new Date().toISOString(),
        timesCompleted: 0,
      };
      const updated = [...challenges, newC];
      saveQuranChallenges(updated);
      setActiveChallengeId(newC.id);

    } else {
      // Create Habit Challenge
      if (!habitTitle.trim() || habitList.length === 0) return;

      const newH: HabitChallengeConfig = {
        id: 'h-' + Date.now(),
        title: habitTitle,
        duration: durationVal,
        habits: habitList,
        progress: {},
        startDate: new Date().toISOString(),
        timesCompleted: 0,
      };
      const updated = [...habitChallenges, newH];
      saveHabitChallenges(updated);
      setActiveChallengeId(newH.id);
    }

    // Reset Forms
    setIsCreating(false);
    setHabitTitle('');
    setHabitList([]);
    setTempHabitInput('');
    setCustomDuration(30);
  };

  // --- Deletion Logic ---
  const requestDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;

    if (deleteTargetId.startsWith('q-')) {
      const updated = challenges.filter(c => c.id !== deleteTargetId);
      saveQuranChallenges(updated);
    } else {
      const updated = habitChallenges.filter(c => c.id !== deleteTargetId);
      saveHabitChallenges(updated);
    }

    if (activeChallengeId === deleteTargetId) {
      setActiveChallengeId(null);
    }
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  // --- Progress Logic (Quran) ---
  const toggleQuranDay = (challengeId: string, dayIndex: number) => {
    const idx = challenges.findIndex(c => c.id === challengeId);
    if (idx === -1) return;
    const challenge = challenges[idx];
    let newCompleted;

    if (challenge.completedDays.includes(dayIndex)) {
      newCompleted = challenge.completedDays.filter(d => d !== dayIndex);
    } else {
      newCompleted = [...challenge.completedDays, dayIndex];
      if (newCompleted.length === challenge.duration) setShowCompletionModal(true);
      else {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
    const updated = [...challenges];
    updated[idx] = { ...challenge, completedDays: newCompleted };
    saveQuranChallenges(updated);
  };

  // --- Progress Logic (Habit) ---
  const toggleHabitItem = (challengeId: string, dayIndex: number, habitIndex: number) => {
    const idx = habitChallenges.findIndex(c => c.id === challengeId);
    if (idx === -1) return;
    const challenge = habitChallenges[idx];
    
    const dayProgress = challenge.progress[dayIndex] || [];
    let newDayProgress;

    if (dayProgress.includes(habitIndex)) {
      newDayProgress = dayProgress.filter(i => i !== habitIndex);
    } else {
      newDayProgress = [...dayProgress, habitIndex];
    }

    const newProgress = { ...challenge.progress, [dayIndex]: newDayProgress };
    
    // Check if ALL days are fully complete (Optional strict check)
    // For now, let's just trigger confetti if day is fully done
    if (newDayProgress.length === challenge.habits.length) {
       setShowConfetti(true);
       setTimeout(() => setShowConfetti(false), 1500);
    }

    // Check Total Completion
    let totalHabitsChecked = 0;
    const totalHabitsPossible = challenge.duration * challenge.habits.length;
    Object.values(newProgress).forEach((arr: any) => totalHabitsChecked += arr.length);
    
    if (totalHabitsChecked === totalHabitsPossible && totalHabitsPossible > 0) {
        setShowCompletionModal(true);
    }

    const updated = [...habitChallenges];
    updated[idx] = { ...challenge, progress: newProgress };
    saveHabitChallenges(updated);
  };

  // --- Restart Logic ---
  const handleFinishAndRestart = () => {
    if (!activeChallengeId) return;

    if (activeChallengeId.startsWith('q-')) {
       const idx = challenges.findIndex(c => c.id === activeChallengeId);
       if (idx === -1) return;
       const c = challenges[idx];
       const updated = [...challenges];
       updated[idx] = { 
         ...c, 
         completedDays: [], 
         timesCompleted: (c.timesCompleted || 0) + 1 
       };
       saveQuranChallenges(updated);
    } else {
       const idx = habitChallenges.findIndex(c => c.id === activeChallengeId);
       if (idx === -1) return;
       const c = habitChallenges[idx];
       const updated = [...habitChallenges];
       updated[idx] = { 
         ...c, 
         progress: {}, 
         timesCompleted: (c.timesCompleted || 0) + 1 
       };
       saveHabitChallenges(updated);
    }

    setShowCompletionModal(false);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // --- Helper: Get Quran Task Text ---
  const getQuranTask = (challenge: ChallengeConfig, dayIndex: number) => {
    const pagesPerDay = challenge.totalPages / challenge.duration;
    const dayStartOffset = Math.floor(dayIndex * pagesPerDay);
    const dayEndOffset = Math.floor((dayIndex + 1) * pagesPerDay) - 1;
    const taskStartPage = challenge.startPage + dayStartOffset;
    const taskEndPage = Math.min(challenge.startPage + dayEndOffset, challenge.endPage);

    if (challenge.type === 'SURAH' && challenge.targetSurah) {
       if (taskStartPage === taskEndPage) return { text: `Page ${taskStartPage}`, subtext: challenge.targetSurah.name_simple };
       return { text: `Page ${taskStartPage} - ${taskEndPage}`, subtext: challenge.targetSurah.name_simple };
    } else {
       if (taskStartPage === taskEndPage) return { text: `Page ${taskStartPage}`, subtext: 'Quraan' };
       return { text: `Page ${taskStartPage} - ${taskEndPage}`, subtext: 'Quraan' };
    }
  };
  
  // --- Filtered Surahs ---
  const filteredSurahs = useMemo(() => {
    return chapters.filter(c => 
      c.name_simple.toLowerCase().includes(surahSearch.toLowerCase()) || 
      c.id.toString().includes(surahSearch)
    );
  }, [chapters, surahSearch]);


  // ================= RENDER =================

  if (loading) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // 1. DASHBOARD VIEW
  if (!activeChallengeId && !isCreating) {
    return (
      <div className="min-h-screen bg-emerald-50/30 pb-20">
        {/* Header with Tabs */}
        <div className="bg-emerald-900 text-white pt-10 pb-8 px-4 rounded-b-[2rem] shadow-xl relative overflow-hidden mb-6">
           <div className="absolute top-0 right-0 opacity-10">
               <Trophy className="w-48 h-48 transform rotate-12" />
           </div>
           <div className="max-w-4xl mx-auto relative z-10">
               <h1 className="text-3xl font-bold mb-6 font-arabic tracking-wide text-center">My Challenges</h1>
               
               {/* Custom Tabs */}
               <div className="flex bg-emerald-950/50 p-1 rounded-full max-w-md mx-auto backdrop-blur-sm border border-emerald-800">
                  <button 
                    onClick={() => setActiveTab('QURAN')}
                    className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'QURAN' ? 'bg-white text-emerald-900 shadow-md' : 'text-emerald-300 hover:text-white'}`}
                  >
                    <BookOpen className="w-4 h-4" />
                    Quran
                  </button>
                  <button 
                    onClick={() => setActiveTab('HABIT')}
                    className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'HABIT' ? 'bg-white text-emerald-900 shadow-md' : 'text-emerald-300 hover:text-white'}`}
                  >
                    <Dumbbell className="w-4 h-4" />
                    Habit Tracker
                  </button>
               </div>
           </div>
        </div>

        <div className="max-w-4xl mx-auto px-4">
            
            {/* --- QURAN LIST --- */}
            {activeTab === 'QURAN' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-300">
                {challenges.map(c => {
                   const percent = Math.round((c.completedDays.length / c.duration) * 100);
                   return (
                      <div key={c.id} onClick={() => setActiveChallengeId(c.id)} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                         <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${percent === 100 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }}></div>
                         <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                                  {c.type === 'ALL' ? <Target className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                </div>
                                <div>
                                   <h3 className="font-bold text-lg text-emerald-950 mb-1 group-hover:text-emerald-700 transition-colors">{c.title}</h3>
                                   <div className="flex items-center gap-3 text-xs text-emerald-600/70 font-medium">
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.duration} Days</span>
                                      {c.timesCompleted > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><RotateCcw className="w-3 h-3" /> x{c.timesCompleted}</span>}
                                      <span>{percent}% Done</span>
                                   </div>
                                </div>
                            </div>
                            <button onClick={(e) => requestDelete(c.id, e)} className="p-2 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 className="w-5 h-5" /></button>
                         </div>
                      </div>
                   )
                })}
                {challenges.length === 0 && <EmptyState type="QURAN" />}
              </div>
            )}

            {/* --- HABIT LIST --- */}
            {activeTab === 'HABIT' && (
              <div className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                {habitChallenges.map(h => {
                   // Calculate Total Habit Progress
                   const totalHabits = h.duration * h.habits.length;
                   let completedCount = 0;
                   Object.values(h.progress).forEach((arr: any) => completedCount += arr.length);
                   const percent = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

                   return (
                      <div key={h.id} onClick={() => setActiveChallengeId(h.id)} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                         <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${percent === 100 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }}></div>
                         <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                               <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600">
                                  <Dumbbell className="w-6 h-6" />
                                </div>
                                <div>
                                   <h3 className="font-bold text-lg text-emerald-950 mb-1 group-hover:text-emerald-700 transition-colors">{h.title}</h3>
                                   <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-600/70 font-medium mb-2">
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {h.duration} Days</span>
                                      {h.timesCompleted > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><RotateCcw className="w-3 h-3" /> x{h.timesCompleted}</span>}
                                   </div>
                                   <div className="flex flex-wrap gap-1">
                                      {h.habits.slice(0, 3).map((habit, i) => (
                                         <span key={i} className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 font-medium">{habit}</span>
                                      ))}
                                      {h.habits.length > 3 && <span className="text-[10px] bg-emerald-50 px-2 py-0.5 rounded text-emerald-600">+{h.habits.length - 3}</span>}
                                   </div>
                                </div>
                            </div>
                            <button onClick={(e) => requestDelete(h.id, e)} className="p-2 text-slate-300 hover:text-rose-500 rounded-full"><Trash2 className="w-5 h-5" /></button>
                         </div>
                      </div>
                   )
                })}
                {habitChallenges.length === 0 && <EmptyState type="HABIT" />}
              </div>
            )}

            {/* Floating FAB */}
            <div className="fixed bottom-24 right-6 z-30">
               <button 
                  onClick={() => setIsCreating(true)}
                  className="flex items-center gap-2 bg-emerald-800 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl shadow-emerald-900/40 hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 border border-emerald-700"
               >
                  <Plus className="w-6 h-6" />
                  <span className="font-bold">New {activeTab === 'QURAN' ? 'Quran' : 'Habit'} Challenge</span>
               </button>
            </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center animate-in zoom-in-95">
               <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
               <h3 className="text-xl font-bold mb-2 text-slate-800">Ma hubtaa?</h3>
               <p className="text-slate-500 mb-6">Ficilkan laguma noqon karo.</p>
               <div className="flex gap-3">
                 <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors">Maya</button>
                 <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors">Haa, Tirtir</button>
               </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. CREATION VIEW (Modernized & Green)
  if (isCreating) {
    return (
      <div className="fixed inset-0 bg-emerald-50 z-50 overflow-y-auto">
         {/* Background Header */}
         <div className="h-48 bg-emerald-900 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
             <button onClick={() => setIsCreating(false)} className="absolute top-6 left-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors z-20">
                 <ArrowLeft className="w-6 h-6" />
             </button>
             <div className="absolute bottom-16 left-0 w-full text-center z-10">
                 <h1 className="text-2xl font-bold text-white tracking-wide">Create New Challenge</h1>
                 <p className="text-emerald-100 text-sm mt-1">Start your journey today</p>
             </div>
         </div>

         {/* Form Container */}
         <div className="max-w-xl mx-auto px-4 -mt-10 pb-20 relative z-10">
             <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 animate-in slide-in-from-bottom-10 duration-300 border border-emerald-100">
                
                {/* Duration Section (Shared) */}
                <div className="mb-8">
                   <div className="flex items-center gap-2 mb-3">
                       <Clock className="w-5 h-5 text-emerald-500" />
                       <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Duration (Days)</label>
                   </div>
                   
                   <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                       <div className="flex items-center gap-4 mb-4">
                           <input 
                              type="range" min="1" max="100" 
                              value={customDuration} 
                              onChange={(e) => setCustomDuration(Number(e.target.value))}
                              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-emerald-200 accent-emerald-600"
                           />
                           <div className="min-w-[60px] text-center font-black text-2xl text-emerald-900">{customDuration}</div>
                       </div>
                       <div className="flex justify-between gap-2">
                           {[7, 30, 75].map(d => (
                               <button 
                                 key={d} 
                                 onClick={() => setCustomDuration(d)}
                                 className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${customDuration === d ? 'bg-emerald-600 text-white shadow-md' : 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}
                               >
                                   {d} Days
                               </button>
                           ))}
                       </div>
                   </div>
                </div>

                {activeTab === 'QURAN' ? (
                   /* QURAN FORM */
                   <div className="space-y-6">
                      <div>
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 block">Challenge Type</label>
                          <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => setQuranType('SURAH')} 
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${quranType === 'SURAH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                             >
                                <div className={`p-2 rounded-full ${quranType === 'SURAH' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100'}`}><BookOpen className="w-5 h-5" /></div>
                                <span className="font-bold text-sm">Specific Surah</span>
                             </button>
                             <button 
                                onClick={() => setQuranType('ALL')} 
                                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${quranType === 'ALL' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-sm' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                             >
                                <div className={`p-2 rounded-full ${quranType === 'ALL' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100'}`}><Target className="w-5 h-5" /></div>
                                <span className="font-bold text-sm">Whole Quran</span>
                             </button>
                          </div>
                      </div>
                      
                      {quranType === 'SURAH' && (
                         <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 block">Select Surah</label>
                            <div className="relative mb-3">
                               <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                               <input 
                                 type="text" 
                                 placeholder="Search Surah..." 
                                 value={surahSearch} 
                                 onChange={(e) => setSurahSearch(e.target.value)} 
                                 className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-900" 
                               />
                            </div>
                            <div className="h-48 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50 custom-scrollbar p-2">
                               {filteredSurahs.map(c => (
                                  <button 
                                    key={c.id} 
                                    onClick={() => setQuranSurahId(c.id)} 
                                    className={`w-full text-left px-4 py-3 mb-1 rounded-xl text-sm flex justify-between items-center transition-colors ${quranSurahId === c.id ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-600 hover:bg-white'}`}
                                  >
                                     <span className="font-bold">{c.id}. {c.name_simple}</span>
                                     <span className={`text-xs ${quranSurahId === c.id ? 'text-emerald-100' : 'text-slate-400'}`}>{c.verses_count} Ayahs</span>
                                  </button>
                               ))}
                            </div>
                         </div>
                      )}
                   </div>
                ) : (
                   /* HABIT FORM */
                   <div className="space-y-6">
                      <div>
                         <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 block">Title</label>
                         <input 
                            type="text" 
                            placeholder="e.g. 75 Hard Challenge"
                            value={habitTitle} 
                            onChange={(e) => setHabitTitle(e.target.value)}
                            className="w-full px-5 py-4 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-medium"
                         />
                      </div>

                      <div>
                         <label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 block">Habits to Track</label>
                         
                         {/* Input Area */}
                         <div className="flex gap-2 mb-4">
                            <input 
                               type="text" 
                               placeholder="Add a habit (e.g. Read, Gym)"
                               value={tempHabitInput} 
                               onChange={(e) => setTempHabitInput(e.target.value)}
                               className="flex-1 px-5 py-3 border border-slate-200 bg-slate-50 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-900"
                               onKeyDown={(e) => e.key === 'Enter' && handleAddHabitItem()}
                            />
                            <button 
                                onClick={handleAddHabitItem} 
                                className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-transform active:scale-95"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                         </div>
                         
                         {/* Chips */}
                         <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            {habitList.map((h, i) => (
                               <div key={i} className="bg-white text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 border border-emerald-100 shadow-sm animate-in zoom-in-50">
                                  {h}
                                  <button onClick={() => handleRemoveHabitItem(i)} className="text-emerald-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
                               </div>
                            ))}
                            {habitList.length === 0 && (
                                <div className="w-full flex flex-col items-center justify-center text-slate-400 py-2">
                                    <Sparkles className="w-6 h-6 mb-1 opacity-50" />
                                    <span className="text-xs">Add habits to build your routine</span>
                                </div>
                            )}
                         </div>
                      </div>
                   </div>
                )}

                <div className="mt-10">
                    <button 
                       onClick={createChallenge}
                       disabled={activeTab === 'HABIT' && (habitList.length === 0 || !habitTitle)}
                       className="w-full py-4 text-white rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-500 to-emerald-700 shadow-emerald-500/30"
                    >
                       <Sparkles className="w-5 h-5 fill-current" /> 
                       Start Challenge
                    </button>
                </div>
             </div>
         </div>
      </div>
    );
  }

  // 3. DETAIL VIEW (Active)
  
  // A) Quran Detail
  if (activeChallengeId && activeChallengeId.startsWith('q-')) {
     const challenge = challenges.find(c => c.id === activeChallengeId);
     if (!challenge) return null;
     
     const progressPercentage = Math.round((challenge.completedDays.length / challenge.duration) * 100);

     return (
        <div className="min-h-screen bg-emerald-50/20 pb-20">
           {showConfetti && <ConfettiOverlay />}
           {showCompletionModal && (
               <AICompletionModal 
                   onRestart={handleFinishAndRestart} 
                   type="QURAN"
               />
           )}
           {/* Quran Header */}
           <DetailHeader 
              title={challenge.title}
              duration={challenge.duration}
              timesCompleted={challenge.timesCompleted}
              progress={progressPercentage}
              colorClass="bg-emerald-900"
              onBack={() => setActiveChallengeId(null)}
           />
           
           <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {Array.from({ length: challenge.duration }).map((_, i) => {
                    const task = getQuranTask(challenge, i);
                    const isCompleted = challenge.completedDays.includes(i);
                    const isLocked = i > 0 && !challenge.completedDays.includes(i - 1);
                    return (
                       <DayCard 
                          key={i} day={i + 1} title={task.text} subtitle={task.subtext}
                          isCompleted={isCompleted} isLocked={isLocked}
                          color="emerald"
                          onClick={() => !isLocked && toggleQuranDay(challenge.id, i)}
                       />
                    )
                 })}
              </div>
              <DeleteButton onClick={(e) => requestDelete(challenge.id, e)} />
           </div>
        </div>
     );
  }

  // B) Habit Detail
  if (activeChallengeId && activeChallengeId.startsWith('h-')) {
     const challenge = habitChallenges.find(c => c.id === activeChallengeId);
     if (!challenge) return null;

     // Calculate total progress
     const totalHabits = challenge.duration * challenge.habits.length;
     let completedCount = 0;
     Object.values(challenge.progress).forEach((arr: any) => completedCount += arr.length);
     const progressPercentage = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;

     return (
        <div className="min-h-screen bg-emerald-50/20 pb-20">
           {showConfetti && <ConfettiOverlay />}
           {showCompletionModal && (
               <AICompletionModal 
                   onRestart={handleFinishAndRestart} 
                   type="HABIT"
               />
           )}
           
           {/* Habit Header */}
           <DetailHeader 
              title={challenge.title}
              duration={challenge.duration}
              timesCompleted={challenge.timesCompleted}
              progress={progressPercentage}
              colorClass="bg-emerald-900"
              onBack={() => setActiveChallengeId(null)}
           />

           <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {Array.from({ length: challenge.duration }).map((_, i) => {
                    const dayProgress = challenge.progress[i] || [];
                    const isFullyDone = dayProgress.length === challenge.habits.length && challenge.habits.length > 0;
                    const countText = `${dayProgress.length}/${challenge.habits.length}`;
                    
                    return (
                       <DayCard 
                          key={i} day={i + 1} title="Habit Checklist" subtitle={`${countText} Done`}
                          isCompleted={isFullyDone} isLocked={false}
                          color="emerald"
                          onClick={() => setSelectedDayForHabit(i)}
                       />
                    )
                 })}
              </div>
              <DeleteButton onClick={(e) => requestDelete(challenge.id, e)} />
           </div>

           {/* HABIT CHECKLIST MODAL */}
           {selectedDayForHabit !== null && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4 animate-in fade-in">
                 <div className="bg-white w-full max-w-sm rounded-t-3xl md:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 md:zoom-in-95">
                    <div className="flex justify-between items-center mb-6">
                       <div>
                          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Day {selectedDayForHabit + 1}</span>
                          <h3 className="text-2xl font-bold text-slate-800">Your Habits</h3>
                       </div>
                       <button onClick={() => setSelectedDayForHabit(null)} className="bg-slate-100 p-2 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-slate-500" /></button>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                       {challenge.habits.map((habit, hIndex) => {
                          const isDone = (challenge.progress[selectedDayForHabit] || []).includes(hIndex);
                          return (
                             <button 
                                key={hIndex}
                                onClick={() => toggleHabitItem(challenge.id, selectedDayForHabit, hIndex)}
                                className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${isDone ? 'bg-emerald-50 border-emerald-200 shadow-inner' : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                             >
                                <span className={`font-medium ${isDone ? 'text-emerald-900 line-through opacity-70' : 'text-slate-700'}`}>{habit}</span>
                                <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                                   {isDone && <Check className="w-4 h-4" />}
                                </div>
                             </button>
                          )
                       })}
                    </div>
                    <button onClick={() => setSelectedDayForHabit(null)} className="w-full py-3 bg-emerald-900 text-white rounded-xl font-bold">Done</button>
                 </div>
              </div>
           )}
        </div>
     );
  }

  return null;
};

// --- Sub-Components ---

const EmptyState = ({ type }: { type: 'QURAN' | 'HABIT' }) => (
  <div className="text-center py-12">
     <div className="inline-flex bg-emerald-50 p-4 rounded-full mb-4 text-emerald-300">
        <LayoutGrid className="w-8 h-8" />
     </div>
     <h3 className="text-slate-600 font-medium mb-1">No active {type.toLowerCase()} challenges</h3>
     <p className="text-slate-400 text-sm">Create a new challenge to get started</p>
  </div>
);

const DetailHeader = ({ title, duration, timesCompleted, progress, colorClass, onBack }: any) => (
  <div className={`${colorClass} text-white pt-6 pb-20 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden`}>
    <button onClick={onBack} className="absolute top-6 left-4 z-20 flex items-center text-white/80 hover:text-white bg-black/20 rounded-full px-3 py-1 backdrop-blur-sm"><ArrowLeft className="w-4 h-4 mr-1" /><span className="text-xs font-bold">Back</span></button>
    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-6 mt-6">
       <div className="text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
             <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-white/90 text-xs font-bold uppercase tracking-wider border border-white/10"><Calendar className="w-3 h-3" /> {duration} Days</div>
             {timesCompleted > 0 && <div className="inline-flex items-center gap-2 bg-emerald-500/30 px-3 py-1 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-500/30"><RotateCcw className="w-3 h-3" /> Finished: {timesCompleted}</div>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-arabic tracking-wide">{title}</h1>
       </div>
       <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
           <svg className="w-full h-full transform -rotate-90">
             <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-black/30" />
             <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-400 transition-all duration-1000 ease-out" strokeDasharray={283} strokeDashoffset={283 - (283 * progress) / 100} strokeLinecap="round"/>
           </svg>
           <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center"><span className="text-2xl font-bold">{progress}%</span></div>
        </div>
    </div>
  </div>
);

const DayCard = ({ day, title, subtitle, isCompleted, isLocked, onClick, color }: any) => (
  <div onClick={onClick} className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[140px] cursor-pointer ${isCompleted ? `bg-${color}-50 border-${color}-200` : isLocked ? 'bg-slate-100 border-slate-200 cursor-not-allowed' : `bg-white border-slate-200 shadow-lg hover:shadow-xl hover:scale-[1.02] z-10`}`}>
     <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isCompleted ? `bg-${color}-200 text-${color}-900` : isLocked ? 'bg-slate-200 text-slate-500' : `bg-${color}-600 text-white`}`}>Day {day}</span>
        {isCompleted ? <div className={`bg-${color}-500 text-white rounded-full p-1 shadow-sm`}><Check className="w-3 h-3" /></div> : isLocked ? <Lock className="w-3 h-3 text-slate-400" /> : <div className={`w-2 h-2 rounded-full bg-${color}-500 animate-pulse`}></div>}
     </div>
     <div><h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{title}</h3><p className={`text-xs ${isLocked ? 'text-slate-400' : 'text-slate-500'}`}>{subtitle}</p></div>
     <button disabled={isLocked} className={`mt-4 w-full py-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isCompleted ? `bg-white border border-${color}-200 text-${color}-700` : isLocked ? 'bg-slate-200 text-slate-400' : `bg-${color}-600 text-white`}`}>{isCompleted ? 'Done' : isLocked ? 'Locked' : 'Open'}</button>
  </div>
);

const DeleteButton = ({ onClick }: any) => (
  <div className="mt-12 text-center pb-8"><button onClick={onClick} className="inline-flex items-center px-4 py-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"><Trash2 className="w-3 h-3 mr-2" /> Delete This Challenge</button></div>
);

const ConfettiOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="absolute animate-bounce text-6xl" style={{ animationDuration: '0.8s' }}>🎉</div>
      <div className="absolute top-1/4 left-1/4 animate-pulse text-4xl">✨</div>
      <div className="absolute top-1/3 right-1/4 animate-pulse text-4xl">🌟</div>
  </div>
);

// AI MESSAGE COMPONENT
const AICompletionModal = ({ onRestart, type }: { onRestart: () => void, type: 'QURAN' | 'HABIT' }) => {
    const [status, setStatus] = useState<'LOADING' | 'READY'>('LOADING');
    const [messageData, setMessageData] = useState<{ text: string; isDua: boolean } | null>(null);

    useEffect(() => {
        // Simulate AI "Thinking"
        const timer1 = setTimeout(() => {
            // Generate Message based on Type
            let msgs = [];
            if (type === 'QURAN') {
                msgs = [
                    { text: "Masha'Allah! Quraanku ha noqdo nuurka qalbigaaga iyo hanuunka noloshaada.", isDua: true },
                    { text: "Ilaahay ha kaa aqbalo, hana kaa dhigo kuwa Quraanka ku dhaqma.", isDua: true },
                    { text: "Dadaalkaagu waa mid miro dhal ah. Sii wad wanaaga iyo cibaadada!", isDua: false },
                    { text: "Guul weyn! Akhriska Quraanku waa ganacsi aan khasaare lahayn.", isDua: false }
                ];
            } else {
                msgs = [
                    { text: "Hambalyo! Joogteyntu waa furaha guusha. Naftaada waad ka adkaatay!", isDua: false },
                    { text: "Maanta waxaad qaaday tallaabo weyn oo horumar ah. Sii wad dadaalka!", isDua: false },
                    { text: "Waa guul cajiib ah! Caadooyinka wanaagsan waxay dhisaan mustaqbal ifaya.", isDua: false },
                    { text: "Ilaahay ha kuu barakeeyo waqtigaaga iyo dadaalkaaga.", isDua: true }
                ];
            }
            const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
            setMessageData(randomMsg);
            setStatus('READY');
        }, 2000); // 2 second delay for effect

        return () => clearTimeout(timer1);
    }, [type]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-900/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                <div className="relative z-10">
                    
                    {status === 'LOADING' ? (
                        <div className="py-10 flex flex-col items-center">
                            <Bot className="w-12 h-12 text-emerald-500 animate-bounce mb-4" />
                            <h3 className="text-xl font-bold text-slate-700 mb-2">AI is thinking...</h3>
                            <p className="text-slate-400 text-sm">Diyaarinta Natiijada...</p>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-bottom-5 duration-500">
                            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"><PartyPopper className="w-10 h-10 text-amber-500" /></div>
                            <h2 className="text-2xl font-bold text-emerald-900 mb-2 font-arabic">Hambalyo!</h2>
                            <h3 className="text-lg font-medium text-emerald-700 mb-4">Waad Dhameysay Challenge-ka</h3>
                            
                            {/* AI Message Box */}
                            <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-6 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-600 border border-emerald-100 shadow-sm flex items-center gap-1">
                                    <Bot className="w-3 h-3" /> AI Message
                                </div>
                                <Heart className="w-5 h-5 text-rose-500 mx-auto mb-2 fill-current animate-pulse" />
                                <p className="text-slate-700 leading-relaxed font-arabic text-lg italic">"{messageData?.text}"</p>
                            </div>
                            
                            <button onClick={onRestart} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
                                {messageData?.isDua ? "Aamiin" : "Waayahay"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Challenge;