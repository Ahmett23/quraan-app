import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, BookHeart, Save, Edit3, PenLine, AlertTriangle } from 'lucide-react';

interface DuaNote {
  id: string;
  title: string;
  content: string;
  date: string;
}

const DuaNotes: React.FC = () => {
  const [duas, setDuas] = useState<DuaNote[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Load Duas from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem('quran_app_duas');
    if (stored) {
      setDuas(JSON.parse(stored));
    }
  }, []);

  const saveToStorage = (updatedDuas: DuaNote[]) => {
    localStorage.setItem('quran_app_duas', JSON.stringify(updatedDuas));
  };

  const openAddModal = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setShowModal(true);
  };

  const openEditModal = (dua: DuaNote) => {
    setEditingId(dua.id);
    setNewTitle(dua.title);
    setNewContent(dua.content);
    setShowModal(true);
  };

  const handleSaveDua = () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    let updatedDuas: DuaNote[];

    if (editingId) {
      // Update existing
      updatedDuas = duas.map(d => 
        d.id === editingId 
          ? { ...d, title: newTitle, content: newContent }
          : d
      );
    } else {
      // Create new
      const newDua: DuaNote = {
        id: Date.now().toString(),
        title: newTitle,
        content: newContent,
        date: new Date().toLocaleDateString('so-SO'),
      };
      updatedDuas = [newDua, ...duas];
    }

    setDuas(updatedDuas);
    saveToStorage(updatedDuas);
    
    // Reset and Close
    setNewTitle('');
    setNewContent('');
    setEditingId(null);
    setShowModal(false);
  };

  // Step 1: Prompt the user
  const promptDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent triggering any parent clicks
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Step 2: Actually delete
  const confirmDelete = () => {
    if (deleteId) {
      const updatedDuas = duas.filter(d => d.id !== deleteId);
      setDuas(updatedDuas);
      saveToStorage(updatedDuas);
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 pb-20">
      {/* Header */}
      <div className="bg-emerald-900 text-white pt-10 pb-16 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <BookHeart className="w-40 h-40 transform rotate-12" />
         </div>
         <div className="max-w-4xl mx-auto relative z-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-arabic tracking-wide">Ducaoyinka</h1>
            <p className="text-emerald-100 opacity-90">Halkan ku keydso ducaoyinkaaga gaarka ah.</p>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        
        {/* Add Button */}
        <div className="flex justify-end mb-6">
           <button 
             onClick={openAddModal}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-2 font-bold transition-transform hover:-translate-y-1"
           >
             <Plus className="w-5 h-5" />
             Ku dar Duca
           </button>
        </div>

        {/* List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {duas.length === 0 ? (
             <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-dashed border-stone-300">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                   <Edit3 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-stone-700 mb-2">Wali wax duca ah kuma jiraan</h3>
                <p className="text-stone-500 mb-6">Ku keydso ducaoyinka aad jeceshahay halkan.</p>
                <button onClick={openAddModal} className="text-emerald-600 font-bold hover:underline">
                   Bilow Hadda
                </button>
             </div>
           ) : (
             duas.map((dua) => (
               <div key={dua.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-md transition-shadow group relative flex flex-col">
                  <div className="flex justify-between items-start mb-3">
                     <h3 className="font-bold text-lg text-stone-800 line-clamp-1 flex-1 pr-2">{dua.title}</h3>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(dua)}
                          className="text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full p-2 transition-colors"
                          title="Wax ka bedel"
                        >
                          <PenLine className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={(e) => promptDelete(e, dua.id)}
                          className="text-stone-300 hover:text-rose-500 hover:bg-rose-50 rounded-full p-2 transition-colors"
                          title="Tirtir"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                  <div className="bg-stone-50 rounded-xl p-4 mb-3 border border-stone-100 flex-grow">
                     <p className="text-stone-900 font-arabic text-xl leading-loose whitespace-pre-wrap">{dua.content}</p>
                  </div>
                  <div className="text-right">
                     <span className="text-xs text-stone-400 font-medium">{dua.date}</span>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
              <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                 <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
                    {editingId ? <PenLine className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingId ? 'Wax ka bedel' : 'Duca Cusub'}
                 </h3>
                 <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Magaca Ducada</label>
                    <input 
                      type="text" 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Tusaale: Ducada Hurdada"
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Ducada</label>
                    <textarea 
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Qor ducada halkan..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 placeholder-stone-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none font-arabic text-xl leading-loose"
                    />
                 </div>

                 <button 
                   onClick={handleSaveDua}
                   disabled={!newTitle.trim() || !newContent.trim()}
                   className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2"
                 >
                   <Save className="w-5 h-5" /> 
                   {editingId ? 'Badbaadi Isbedelka' : 'Keydi Ducada'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 scale-100 animate-in zoom-in-95 duration-200 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle className="w-8 h-8 text-rose-500" />
              </div>
              
              <h3 className="text-xl font-bold text-stone-800 mb-2">Ma hubtaa?</h3>
              <p className="text-stone-500 mb-6">
                Ma hubtaa inaad tirtirto ducadan? Ficilkan laguma noqon karo.
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
};

export default DuaNotes;