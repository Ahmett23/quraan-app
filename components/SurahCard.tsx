import React from 'react';
import { Chapter } from '../types';
import { useNavigate } from 'react-router-dom';

interface SurahCardProps {
  chapter: Chapter;
}

const SurahCard: React.FC<SurahCardProps> = ({ chapter }) => {
  const navigate = useNavigate();

  // Handle navigation to the specific start page of the Surah
  const handleClick = () => {
    navigate(`/reader?page=${chapter.pages[0]}&surah=${chapter.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white border border-stone-200 rounded-xl p-4 hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all duration-200 flex items-center justify-between group"
    >
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-emerald-800 font-bold text-sm group-hover:bg-emerald-100 transition-colors">
          {chapter.id}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700">{chapter.name_simple}</h3>
          <p className="text-xs text-gray-500">{chapter.translated_name.name}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="font-arabic text-xl text-gray-800">{chapter.name_arabic}</span>
        <p className="text-xs text-gray-400 mt-1">{chapter.verses_count} Ayahs</p>
      </div>
    </div>
  );
};

export default SurahCard;