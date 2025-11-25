import { Chapter, Verse } from '../types';

const BASE_URL = 'https://api.quran.com/api/v4';

// Cache for chapters to avoid re-fetching
let chaptersCache: Chapter[] | null = null;

export const getChapters = async (): Promise<Chapter[]> => {
  if (chaptersCache) return chaptersCache;
  
  try {
    const response = await fetch(`${BASE_URL}/chapters?language=en`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    const data = await response.json();
    chaptersCache = data.chapters;
    return data.chapters;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getVersesByPage = async (pageNumber: number): Promise<Verse[]> => {
  try {
    // Removed translations=131 to stop loading translation data.
    // Ensure we get verse_key, text_uthmani, and audio info.
    const response = await fetch(
      `${BASE_URL}/verses/by_page/${pageNumber}?language=en&words=false&translations=&fields=text_uthmani,chapter_id&audio=1`
    );
    if (!response.ok) throw new Error('Failed to fetch verses');
    const data = await response.json();
    
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAudioUrl = (verseKey: string): string => {
   // Reciter 7 is Mishary Rashid Alafasy
   const [surah, ayah] = verseKey.split(':');
   const s = surah.padStart(3, '0');
   const a = ayah.padStart(3, '0');
   return `https://verses.quran.com/Alafasy/mp3/${s}${a}.mp3`;
}