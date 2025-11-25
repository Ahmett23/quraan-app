import React, { useState, useEffect, useMemo } from 'react';
import { Check, Lock, RefreshCw, Trophy, ArrowRight, BookOpen, Target, Calendar, Plus, ChevronDown, Search, Sparkles, LayoutGrid, ArrowLeft, Trash2, PartyPopper, Heart, AlertTriangle, RotateCcw } from 'lucide-react';
import { getChapters } from '../services/api';
import { Chapter } from '../types';

// --- Types ---
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
  timesCompleted: number; // New field to track how many times finished
}

const Challenge: React.FC = () => {
  // Global Data State
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Challenges State
  const [challenges, setChallenges] = useState<ChallengeConfig[]>([]);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // UI State
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<'ALL' | 'SURAH'>('SURAH');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [customDuration, setCustomDuration] = useState<number | string>(30); // Allow string for typing
  const [surahSearch, setSurahSearch] = useState('');

  // Load Data
  useEffect(() => {
    const init = async () => {
      const data = await getChapters();
      setChapters(data);
      setLoading(false);

      // Load new array format
      const stored = localStorage.getItem('quran_app_challenges');
      if (stored) {
        setChallenges(JSON.parse(stored));
      } else {
        // Fallback: Check for old single challenge format and migrate it
        const oldSingle = localStorage.getItem('quran_app_custom_challenge');
        if (oldSingle) {
          const parsed = JSON.parse(oldSingle);
          // Add title if missing
          if (!parsed.title) {
             parsed.title = parsed.type === 'SURAH' && parsed.targetSurah 
                ? `Surat ${parsed.targetSurah.name_simple}` 
                : 'Khatmul Quran';
          }
          // Add timesCompleted if missing
          if (parsed.timesCompleted === undefined) {
             parsed.timesCompleted = 0;
          }
          const newArr = [parsed];
          setChallenges(newArr);
          localStorage.setItem('quran_app_challenges', JSON.stringify(newArr));
        }
      }
    };
    init();
  }, []);

  // --- Actions ---

  const saveChallenges = (newChallenges: ChallengeConfig[]) => {
    setChallenges(newChallenges);
    localStorage.setItem('quran_app_challenges', JSON.stringify(newChallenges));
  };

  const handleStartChallenge = () => {
    let totalPages = 604;
    let startPage = 1;
    let endPage = 604;
    let targetSurah: Chapter | undefined;
    let title = "Khatmul Quran";

    if (selectedType === 'SURAH') {
      targetSurah = chapters.find(c => c.id === selectedSurahId);
      if (targetSurah) {
        startPage = targetSurah.pages[0];
        endPage = targetSurah.pages[1];
        totalPages = (endPage - startPage) + 1;
        title = `Surat ${targetSurah.name_simple}`;
      }
    }

    const durationVal = Number(customDuration) || 30; // Fallback

    const newChallenge: ChallengeConfig = {
      id: Date.now().toString(),
      type: selectedType,
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

    const updated = [...challenges, newChallenge];
    saveChallenges(updated);
    
    // Reset Form
    setIsCreating(false);
    // Automatically open the new challenge
    setActiveChallengeId(newChallenge.id);
  };

  // Step 1: Request Delete
  const requestDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  // Step 2: Confirm Delete
  const confirmDelete = () => {
    if (!deleteTargetId) return;
    
    const updated = challenges.filter(c => c.id !== deleteTargetId);
    saveChallenges(updated);
    
    // If we deleted the active one, go back to list
    if (activeChallengeId === deleteTargetId) {
       setActiveChallengeId(null);
    }
    
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const toggleDay = (challengeId: string, dayIndex: number) => {
    const challengeIndex = challenges.findIndex(c => c.id === challengeId);
    if (challengeIndex === -1) return;

    const challenge = challenges[challengeIndex];
    let newCompleted;
    
    if (challenge.completedDays.includes(dayIndex)) {
      newCompleted = challenge.completedDays.filter(d => d !== dayIndex);
    } else {
      newCompleted = [...challenge.completedDays, dayIndex];
      // Check if finished specifically this turn
      if (newCompleted.length === challenge.duration) {
          setShowCompletionModal(true);
      } else {
          // Regular small confetti for daily progress
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 2000);
      }
    }

    const updatedChallenge = { ...challenge, completedDays: newCompleted };
    const updatedChallenges = [...challenges];
    updatedChallenges[challengeIndex] = updatedChallenge;
    
    saveChallenges(updatedChallenges);
  };

  const handleFinishAndRestart = () => {
    if (!activeChallengeId) return;
    
    const challengeIndex = challenges.findIndex(c => c.id === activeChallengeId);
    if (challengeIndex === -1) return;

    const challenge = challenges[challengeIndex];
    
    // Increment count and reset days
    const updatedChallenge = { 
        ...challenge, 
        completedDays: [], // Reset days
        timesCompleted: (challenge.timesCompleted || 0) + 1, // Increment count
        startDate: new Date().toISOString() // Optional: Update start date
    };

    const updatedChallenges = [...challenges];
    updatedChallenges[challengeIndex] = updatedChallenge;
    
    saveChallenges(updatedChallenges);
    setShowCompletionModal(false);
    
    // Show confetti one last time
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // --- Helpers ---

  const getDayTask = (challenge: ChallengeConfig, dayIndex: number) => {
    const pagesPerDay = challenge.totalPages / challenge.duration;
    
    const dayStartOffset = Math.floor(dayIndex * pagesPerDay);
    const dayEndOffset = Math.floor((dayIndex + 1) * pagesPerDay) - 1;

    const taskStartPage = challenge.startPage + dayStartOffset;
    const taskEndPage = Math.min(challenge.startPage + dayEndOffset, challenge.endPage);

    if (challenge.type === 'SURAH' && challenge.targetSurah) {
       if (taskStartPage === taskEndPage) return { text: `Read Page ${taskStartPage}`, subtext: challenge.targetSurah.name_simple };
       return { text: `Read Page ${taskStartPage} - ${taskEndPage}`, subtext: challenge.targetSurah.name_simple };
    } else {
       if (taskStartPage === taskEndPage) return { text: `Page ${taskStartPage}`, subtext: 'Quraan' };
       return { text: `Page ${taskStartPage} - ${taskEndPage}`, subtext: 'Quraan' };
    }
  };

  const filteredSurahs = useMemo(() => {
    return chapters.filter(c => 
      c.name_simple.toLowerCase().includes(surahSearch.toLowerCase()) || 
      c.id.toString().includes(surahSearch)
    );
  }, [chapters, surahSearch]);


  // --- Render ---

  // 1. Loading
  if (loading) return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  // 2. Dashboard List View (If no active challenge selected AND not creating)
  if (!activeChallengeId && !isCreating) {
     return (
        <div className="min-h-screen bg-sand-50 pb-20">
           {/* Header */}
           <div className="bg-emerald-900 text-white pt-10 pb-16 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 opacity-10">
                  <Trophy className="w-48 h-48 transform rotate-12" />
              </div>
              <div className="max-w-4xl mx-auto relative z-10">
                  <h1 className="text-3xl font-bold mb-2 font-arabic tracking-wide">My Challenges</h1>
                  <p className="text-emerald-100 opacity-80">La soco horumarkaaga dhamaan challenges-ka.</p>
              </div>
           </div>

           <div className="max-w-4xl mx-auto px-4">
              {/* Active Challenges List */}
              <div className="grid gap-4">
                 {challenges.map(c => {
                    const percent = Math.round((c.completedDays.length / c.duration) * 100);
                    const isFinished = percent === 100;
                    return (
                       <div 
                         key={c.id} 
                         onClick={() => setActiveChallengeId(c.id)}
                         className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                       >
                          {/* Progress Bar BG */}
                          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${isFinished ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${percent}%` }}></div>

                          <div className="flex justify-between items-start">
                             <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${c.type === 'ALL' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                   {c.type === 'ALL' ? <Target className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                                </div>
                                <div>
                                   <h3 className="font-bold text-lg text-stone-800 mb-1 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                                       {c.title}
                                       {isFinished && <Trophy className="w-4 h-4 text-amber-500 fill-current" />}
                                   </h3>
                                   <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-stone-500">
                                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.duration} Days</span>
                                      
                                      {/* Times Completed Badge */}
                                      {c.timesCompleted > 0 && (
                                          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                                              <RotateCcw className="w-3 h-3" /> Dhameysay: {c.timesCompleted}
                                          </span>
                                      )}

                                      <span className="hidden sm:inline w-1 h-1 bg-stone-300 rounded-full"></span>
                                      <span>{percent}% Complete</span>
                                   </div>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => requestDelete(c.id, e)}
                                  className="p-2 text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors z-10"
                                >
                                   <Trash2 className="w-5 h-5" />
                                </button>
                                <div className="p-2 text-stone-300">
                                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>

              {/* Empty State / Add New */}
              {challenges.length === 0 && (
                 <div className="text-center py-12">
                    <div className="inline-flex bg-stone-100 p-4 rounded-full mb-4 text-stone-400">
                       <LayoutGrid className="w-8 h-8" />
                    </div>
                    <h3 className="text-stone-600 font-medium mb-1">No active challenges</h3>
                    <p className="text-stone-400 text-sm">Create your first challenge to get started</p>
                 </div>
              )}

              {/* Floating FAB */}
              <div className="fixed bottom-24 right-6 z-30">
                 <button 
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-stone-900 text-white pl-4 pr-6 py-4 rounded-full shadow-2xl hover:bg-black transition-all hover:scale-105 active:scale-95"
                 >
                    <Plus className="w-6 h-6" />
                    <span className="font-bold">New Challenge</span>
                 </button>
              </div>
           </div>

            {/* Delete Confirmation Modal (Global for List) */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-rose-500" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-stone-800 mb-2">Ma hubtaa?</h3>
                    <p className="text-stone-500 mb-6">
                        Ma hubtaa inaad tirtirto challenge-kan? Ficilkan laguma noqon karo.
                    </p>
                    
                    <div className="flex gap-3">
                        <button 
                        onClick={() => setShowDeleteModal(false)}
                        className="flex-1 py-3 text-stone-500 hover:bg-stone-50 rounded-xl font-bold transition-colors"
                        >
                        Maya
                        </button>
                        <button 
                        onClick={confirmDelete}
                        className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-500/20"
                        >
                        Haa, Tirtir
                        </button>
                    </div>
                </div>
                </div>
            )}
        </div>
     );
  }

  // 3. Create Mode
  if (isCreating) {
    return (
      <div className="min-h-screen bg-sand-50 pb-20 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100 animate-in zoom-in-95 duration-200">
           {/* Header */}
           <div className="bg-emerald-900 p-6 text-center relative overflow-hidden">
              <button 
                 onClick={() => setIsCreating(false)}
                 className="absolute top-4 left-4 text-emerald-200 hover:text-white transition-colors"
              >
                 <ArrowLeft className="w-6 h-6" />
              </button>
              <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h1 className="text-xl font-bold text-white mb-1">Create New Challenge</h1>
           </div>

           <div className="p-6">
              {/* Step 1: Type */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">1. Challenge Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setSelectedType('SURAH')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedType === 'SURAH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-stone-100 hover:border-emerald-200 text-stone-500'}`}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="font-bold text-sm">Surah</span>
                  </button>
                  <button 
                    onClick={() => setSelectedType('ALL')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedType === 'ALL' ? 'border-purple-500 bg-purple-50 text-purple-900' : 'border-stone-100 hover:border-purple-200 text-stone-500'}`}
                  >
                    <Target className="w-6 h-6" />
                    <span className="font-bold text-sm">Khatmah</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Surah Selection */}
              {selectedType === 'SURAH' && (
                 <div className="mb-6 animate-in slide-in-from-top-2 fade-in">
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">2. Select Surah</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                        <input 
                           type="text" 
                           placeholder="Search Surah..." 
                           value={surahSearch}
                           onChange={(e) => setSurahSearch(e.target.value)}
                           className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                    </div>
                    <div className="h-32 overflow-y-auto border border-stone-200 rounded-lg bg-stone-50 custom-scrollbar">
                       {filteredSurahs.map(chapter => (
                          <div 
                             key={chapter.id}
                             onClick={() => setSelectedSurahId(chapter.id)}
                             className={`px-3 py-2 text-sm cursor-pointer hover:bg-emerald-100 flex justify-between ${selectedSurahId === chapter.id ? 'bg-emerald-100 text-emerald-900 font-bold' : 'text-stone-600'}`}
                          >
                             <span>{chapter.id}. {chapter.name_simple}</span>
                             <span className="text-xs opacity-50">{chapter.verses_count} ayahs</span>
                          </div>
                       ))}
                    </div>
                 </div>
              )}

              {/* Step 3: Duration */}
              <div className="mb-8">
                 <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Duration (Maalmood)</label>
                 <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                    <div className="flex items-center gap-4">
                       <input 
                          type="number"
                          min="1"
                          placeholder="e.g. 30"
                          value={customDuration}
                          onChange={(e) => setCustomDuration(e.target.value)}
                          className="w-full px-4 py-3 text-xl font-bold text-center text-emerald-900 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                       />
                       <span className="text-sm font-bold text-stone-500 uppercase">Days</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-2 text-center">
                       Qor maalmaha aad rabto inaad ku dhameyso (tusaale: 7, 30, 100)
                    </p>
                 </div>
              </div>

              <button 
                 onClick={handleStartChallenge}
                 disabled={!Number(customDuration)}
                 className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Sparkles className="w-5 h-5" />
                 Start Challenge
              </button>
           </div>
        </div>
      </div>
    );
  }

  // 4. Detail View (Active Challenge)
  const challenge = challenges.find(c => c.id === activeChallengeId);
  if (!challenge) return null; // Should not happen

  const progressPercentage = Math.round((challenge.completedDays.length / challenge.duration) * 100);

  return (
    <div className="min-h-screen bg-sand-50 pb-20 relative overflow-x-hidden">
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="absolute animate-bounce text-6xl" style={{ animationDuration: '0.8s' }}>🎉</div>
            <div className="absolute top-1/4 left-1/4 animate-pulse text-4xl">✨</div>
            <div className="absolute top-1/3 right-1/4 animate-pulse text-4xl">🌟</div>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-900/80 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
               {/* Decorative background */}
               <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
               
               <div className="relative z-10">
                   <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <PartyPopper className="w-10 h-10 text-amber-500" />
                   </div>
                   
                   <h2 className="text-2xl font-bold text-emerald-900 mb-2 font-arabic">Hambalyo!</h2>
                   <h3 className="text-lg font-medium text-emerald-700 mb-4">Waad Dhameysay Challenge-ka</h3>
                   
                   <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6">
                      <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2 fill-current animate-pulse" />
                      <p className="text-stone-600 leading-relaxed font-arabic text-lg">
                         "Alle ha kaa aqbalo dadaalkaaga. Challenge-ka wuxuu kuu bilaabanayaa markale."
                      </p>
                   </div>

                   <button 
                      onClick={handleFinishAndRestart}
                      className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
                   >
                      Aamiin (Dib u bilow)
                   </button>
               </div>
            </div>
         </div>
      )}

       {/* Delete Confirmation Modal (Detail View) */}
       {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 text-center">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-2">Ma hubtaa?</h3>
                <p className="text-stone-500 mb-6">
                    Ma hubtaa inaad tirtirto challenge-kan? Ficilkan laguma noqon karo.
                </p>
                
                <div className="flex gap-3">
                    <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 text-stone-500 hover:bg-stone-50 rounded-xl font-bold transition-colors"
                    >
                    Maya
                    </button>
                    <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-rose-500/20"
                    >
                    Haa, Tirtir
                    </button>
                </div>
            </div>
            </div>
        )}

      {/* Header Section */}
      <div className="bg-emerald-900 text-white pt-6 pb-20 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Back Button */}
        <button 
           onClick={() => setActiveChallengeId(null)}
           className="absolute top-6 left-4 z-20 flex items-center text-emerald-100 hover:text-white transition-colors bg-emerald-800/50 rounded-full px-3 py-1 backdrop-blur-sm"
        >
           <ArrowLeft className="w-4 h-4 mr-1" />
           <span className="text-xs font-bold">Back</span>
        </button>

        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between relative z-10 gap-6 mt-6">
           <div className="text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                 <div className="inline-flex items-center gap-2 bg-emerald-800/50 px-3 py-1 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-wider border border-emerald-700">
                    <Calendar className="w-3 h-3" />
                    {challenge.duration} Day Challenge
                 </div>
                 {challenge.timesCompleted > 0 && (
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full text-amber-200 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                        <RotateCcw className="w-3 h-3" />
                        Dhameysay: {challenge.timesCompleted}
                    </div>
                 )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2 font-arabic tracking-wide">
                 {challenge.title}
              </h1>
              <p className="text-emerald-100 opacity-80 text-sm">
                 Consistency is key.
              </p>
           </div>

           {/* Circular Progress */}
           <div className="relative w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-950/30" />
                 <circle 
                    cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                    className="text-yellow-400 transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                    strokeDasharray={283} 
                    strokeDashoffset={283 - (283 * progressPercentage) / 100} 
                    strokeLinecap="round"
                 />
               </svg>
               <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{progressPercentage}%</span>
               </div>
            </div>
        </div>
      </div>

      {/* Days Grid */}
      <div className="max-w-5xl mx-auto px-4 -mt-10 relative z-20">
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: challenge.duration }).map((_, index) => {
               const dayNum = index + 1;
               const { text, subtext } = getDayTask(challenge, index);
               const isCompleted = challenge.completedDays.includes(index);
               const isLocked = index > 0 && !challenge.completedDays.includes(index - 1);

               return (
                 <div 
                    key={index}
                    className={`
                       relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between min-h-[140px]
                       ${isCompleted 
                          ? 'bg-emerald-50 border-emerald-200' 
                          : isLocked 
                             ? 'bg-stone-100 border-stone-200' 
                             : 'bg-white border-stone-200 shadow-xl shadow-emerald-900/5 ring-2 ring-emerald-500/20 scale-[1.02] z-10'
                       }
                    `}
                 >
                    <div className="flex justify-between items-start mb-3">
                       <span className={`
                          text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded
                          ${isCompleted ? 'bg-emerald-200 text-emerald-800' : isLocked ? 'bg-stone-200 text-stone-500' : 'bg-emerald-600 text-white'}
                       `}>
                          Day {dayNum}
                       </span>
                       {isCompleted ? (
                          <div className="bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                             <Check className="w-3 h-3" />
                          </div>
                       ) : isLocked ? (
                          <Lock className="w-3 h-3 text-stone-400" />
                       ) : (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       )}
                    </div>
                    
                    <div>
                        <h3 className={`font-bold text-lg mb-1 ${isLocked ? 'text-stone-400' : 'text-stone-800'}`}>
                           {text}
                        </h3>
                        <p className={`text-xs ${isLocked ? 'text-stone-400' : 'text-stone-500'}`}>{subtext}</p>
                    </div>

                    <button
                       onClick={() => !isLocked && toggleDay(challenge.id, index)}
                       disabled={isLocked}
                       className={`
                          mt-4 w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                          ${isCompleted 
                             ? 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50' 
                             : isLocked 
                                ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg shadow-emerald-600/20'
                          }
                       `}
                    >
                       {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Mark Done'}
                       {!isLocked && !isCompleted && <ArrowRight className="w-4 h-4" />}
                    </button>
                 </div>
               );
            })}
         </div>

         {/* Delete Challenge Option */}
         <div className="mt-12 text-center pb-8">
            <button 
               onClick={(e) => requestDelete(challenge.id, e)}
               className="inline-flex items-center px-4 py-2 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
            >
               <Trash2 className="w-3 h-3 mr-2" /> Delete This Challenge
            </button>
         </div>
      </div>
    </div>
  );
};

export default Challenge;