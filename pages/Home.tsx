import React, { useEffect, useState } from 'react';
import { getChapters } from '../services/api';
import { Chapter } from '../types';
import SurahCard from '../components/SurahCard';
import { Search, Loader2 } from 'lucide-react';

const Home: React.FC = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const data = await getChapters();
        setChapters(data);
      } finally {
        setLoading(false);
      }
    };
    fetchChapters();
  }, []);

  const filteredChapters = chapters.filter(
    (c) =>
      c.name_simple.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name_arabic.includes(searchQuery) ||
      c.translated_name.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      {/* Hero Section */}
      <div className="bg-emerald-900 text-white py-12 px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-arabic mb-4">Quraanka Kariimka</h2>
        <p className="text-emerald-100 max-w-md mx-auto mb-8">
          Dooro surad si aad u bilowdo akhriska.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-white sm:text-sm shadow-md"
            placeholder="Raadi Surah (Example: Yasin)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Surah List */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-xl shadow-sm">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="ml-2 text-gray-600">Loading chapters...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChapters.map((chapter) => (
              <SurahCard key={chapter.id} chapter={chapter} />
            ))}
            {filteredChapters.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Lama helin surad u dhiganta "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;