import React from 'react';
import { Verse } from '../types';

interface VerseItemProps {
  verse: Verse;
  isFavorite: boolean;
  isSelected: boolean;
  onSelect: (verse: Verse) => void;
}

const VerseItem: React.FC<VerseItemProps> = ({ verse, isFavorite, isSelected, onSelect }) => {
  // Arabic numbers helper
  const toArabicNumerals = (n: number) => {
    return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);
  };

  return (
    <span 
      onClick={() => onSelect(verse)}
      className={`
        relative inline leading-[2.8] text-3xl font-arabic cursor-pointer rounded px-1 transition-colors duration-200 select-none
        ${isSelected ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-stone-100 text-stone-900'}
        ${isFavorite && !isSelected ? 'text-emerald-700' : ''}
      `}
      dir="rtl"
    >
      {/* Verse Text */}
      {verse.text_uthmani}{' '}
      
      {/* End of Ayah Symbol */}
      <span className="inline-flex items-center justify-center w-8 h-8 mx-1 align-middle text-2xl text-emerald-600 relative">
        <span className="absolute inset-0 flex items-center justify-center pt-1" style={{ fontFamily: 'Amiri' }}>۝</span>
        <span className="relative text-[0.6em] font-bold pt-1">{toArabicNumerals(verse.verse_number)}</span>
      </span>
    </span>
  );
};

export default VerseItem;