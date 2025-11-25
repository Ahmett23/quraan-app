import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getVersesByPage, getChapters } from '../services/api';
import { Verse, Chapter } from '../types';
import VerseItem from '../components/VerseItem';
import AudioPlayer from '../components/AudioPlayer';
import { ChevronLeft, ChevronRight, Loader2, Heart, X, ArrowLeft } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

const TOTAL_PAGES = 604;

const Reader: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const pageParam = searchParams.get('page');
  const initialPage = pageParam ? parseInt(pageParam, 10) : 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  
  // Interaction state
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);

  useEffect(() => {
    getChapters().then(setChapters);
  }, []);

  useEffect(() => {
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }
  }, [pageParam]);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setSelectedVerse(null);
      try {
        const data = await getVersesByPage(currentPage);
        setVerses(data);
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < TOTAL_PAGES) {
      const nextPage = currentPage + 1;
      setSearchParams({ page: nextPage.toString() });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setSearchParams({ page: prevPage.toString() });
    }
  };

  const getPageTitle = () => {
    if (!verses.length || !chapters.length) return "Quraan Kariim";
    const verseChapterId = verses[0].chapter_id;
    const chapter = chapters.find(c => c.id === verseChapterId);
    return chapter ? `Surat ${chapter.name_simple}` : "Quraan Kariim";
  };
  
  const getJuzNumber = () => {
      if(verses.length > 0) return (verses[0] as any).juz_number;
      return null;
  };

  const currentAudioUrl = selectedVerse?.audio?.url 
    ? `https://verses.quran.com/${selectedVerse.audio.url}` 
    : undefined;

  return (
    // Fixed positioning to fill the screen below the navbar (top-16)
    <div className="fixed inset-x-0 bottom-0 md:top-24 top-16 flex flex-col bg-white z-0">
      
      {/* Top Header Strip */}
      <div className="flex-none h-14 border-b border-stone-100 flex items-center justify-between px-4 bg-white z-20 shadow-sm">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-stone-500 hover:text-emerald-700 transition-colors py-2"
          >
             <ArrowLeft className="w-5 h-5 mr-1" />
             <span className="text-sm font-medium">Dib u noqo</span>
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-sm font-bold text-stone-800 font-arabic">{getPageTitle()}</span>
             {getJuzNumber() && <span className="text-[10px] text-stone-400 uppercase tracking-widest">Juz {getJuzNumber()}</span>}
          </div>

          <div className="w-20"></div> {/* Spacer */}
      </div>

      {/* Main Reading Area - Scrollable */}
      <div className="flex-grow overflow-y-auto bg-white relative flex justify-center py-4 md:py-6 scroll-smooth">
        {loading ? (
            <div className="flex flex-col items-center justify-center space-y-4 h-64">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-sm text-stone-400">Loading page...</p>
            </div>
        ) : (
            // Page Container (Clean Book Style - No Background/Borders)
            <div className="w-full max-w-[500px] md:max-w-[650px] px-4 md:px-0 mx-auto">
                 <div className="bg-white min-h-[80vh] relative">
                     
                     <div className="px-2 py-4 md:px-6 md:py-8 relative z-10">
                         {/* Text Container with 15-line style settings */}
                         <div 
                           className="text-justify [text-align-last:center] leading-[2.8] md:leading-[3.2] text-2xl md:text-[32px] font-arabic text-black" 
                           dir="rtl"
                         >
                            {verses.map((verse) => {
                                // Determine if we should show Bismillah
                                // Show if it's Verse 1 AND NOT Surah Fatiha (1) AND NOT Surah Tawbah (9)
                                const showBismillah = verse.verse_number === 1 && verse.chapter_id !== 1 && verse.chapter_id !== 9;

                                return (
                                    <React.Fragment key={verse.id}>
                                        {showBismillah && (
                                            <div className="w-full text-center py-6 mb-2 select-none">
                                                <span className="font-arabic text-3xl md:text-4xl text-emerald-900 opacity-90 block" style={{ fontFamily: 'Amiri' }}>
                                                    بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                                                </span>
                                            </div>
                                        )}
                                        <VerseItem 
                                            verse={verse} 
                                            isFavorite={isFavorite(verse.verse_key)}
                                            isSelected={selectedVerse?.id === verse.id}
                                            onSelect={setSelectedVerse}
                                        />
                                    </React.Fragment>
                                );
                            })}
                         </div>
                     </div>
                     
                     {/* Page Number Footer */}
                     <div className="text-center py-6">
                        <span className="text-xs font-serif text-stone-400 font-bold">{currentPage}</span>
                     </div>
                 </div>
            </div>
        )}
      </div>

      {/* Bottom Navigation Control - Fixed at bottom */}
      <div className="flex-none h-16 border-t border-stone-100 bg-white flex items-center justify-between px-6 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
           <button 
             onClick={handlePrevPage}
             disabled={currentPage <= 1}
             className="flex items-center space-x-2 px-4 py-2 rounded-full hover:bg-stone-50 disabled:opacity-30 disabled:hover:bg-transparent text-emerald-800 transition-colors"
           >
             <ChevronLeft className="w-5 h-5" />
             <span className="hidden sm:inline font-medium">Previous</span>
           </button>
           
           <div className="text-xs font-medium text-stone-400">
             Page {currentPage} of {TOTAL_PAGES}
           </div>

           <button 
             onClick={handleNextPage}
             disabled={currentPage >= TOTAL_PAGES}
             className="flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 disabled:opacity-30 disabled:bg-transparent text-emerald-800 transition-colors"
           >
             <span className="hidden sm:inline font-medium">Next Page</span>
             <ChevronRight className="w-5 h-5" />
           </button>
      </div>

      {/* Floating Action Bar for Selected Verse */}
      {selectedVerse && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-auto max-w-[90%] z-30">
            <div className="bg-slate-900/95 backdrop-blur-sm text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
               <div className="flex flex-col min-w-[60px]">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Ayah</span>
                  <span className="text-sm font-bold">{selectedVerse.verse_key}</span>
               </div>
               
               <div className="h-8 w-px bg-slate-700"></div>

               <div className="flex items-center gap-1">
                   <AudioPlayer audioUrl={currentAudioUrl} />
               </div>
               
               <button 
                 onClick={() => toggleFavorite(selectedVerse.verse_key)}
                 className={`p-2 rounded-full transition-all ${isFavorite(selectedVerse.verse_key) ? 'text-rose-500 bg-rose-500/10' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
               >
                 <Heart className={`w-5 h-5 ${isFavorite(selectedVerse.verse_key) ? 'fill-current' : ''}`} />
               </button>

               <div className="h-8 w-px bg-slate-700"></div>

               <button onClick={() => setSelectedVerse(null)} className="p-1 text-slate-400 hover:text-white transition-colors">
                   <X className="w-5 h-5" />
               </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Reader;