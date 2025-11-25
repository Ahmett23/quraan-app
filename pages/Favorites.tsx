import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="bg-emerald-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center text-emerald-200 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Dib u noqo
          </Link>
          <h2 className="text-2xl font-bold flex items-center">
             <BookOpen className="w-6 h-6 mr-2" />
             Aayadaha Keydsan
          </h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm border border-stone-200">
            <p className="text-gray-500 text-lg mb-4">Wali ma aadan keydin aayado.</p>
            <Link to="/" className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
              Bilow Akhriska
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
             <div className="divide-y divide-stone-100">
               {favorites.map(key => {
                 const [surah, ayah] = key.split(':');
                 // Getting page info just from key is hard without API context, 
                 // so we link to the Surah generally or we would need to store Page Number in favorites too.
                 // For now, we link to a guess or just display the key.
                 return (
                   <div key={key} className="p-4 flex justify-between items-center hover:bg-stone-50">
                      <div>
                        <span className="text-emerald-800 font-bold text-lg">Surah {surah}, Ayah {ayah}</span>
                      </div>
                      <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">
                        Keydka
                      </span>
                   </div>
                 )
               })}
             </div>
             <div className="p-4 bg-stone-50 text-center text-sm text-gray-500">
               Si aad u aragto aayada oo dhameystiran, fadlan ka raadi Surada guriga.
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;