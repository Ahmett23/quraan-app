import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('quran_app_favorites');
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (verseKey: string) => {
    let newFavorites;
    if (favorites.includes(verseKey)) {
      newFavorites = favorites.filter((key) => key !== verseKey);
    } else {
      newFavorites = [...favorites, verseKey];
    }
    setFavorites(newFavorites);
    localStorage.setItem('quran_app_favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (verseKey: string) => favorites.includes(verseKey);

  return { favorites, toggleFavorite, isFavorite };
};