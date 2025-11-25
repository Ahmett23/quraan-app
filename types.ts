export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  page_number: number;
  verse_number: number;
  chapter_id: number; // Added for Bismillah logic
  words: Word[];
  translations?: Translation[];
  audio?: AudioFile;
}

export interface Word {
  id: number;
  position: number;
  audio_url: string;
  char_type_name: string;
  text_uthmani: string;
  text_indopak: string;
  translation?: {
    text: string;
    language_name: string;
  }
}

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface AudioFile {
  url: string;
  segments: any[];
}

export interface SearchResult {
  key: string;
  text: string;
}