
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, BookOpen, Globe } from 'lucide-react';

const Login: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let success = false;
      if (isLoginMode) {
        success = await login(email, password);
      } else {
        if (!name.trim()) {
           setError("Fadlan qor magacaaga.");
           setLoading(false);
           return;
        }
        success = await register(name, email, password);
      }

      if (success) {
        navigate('/profile');
      } else {
        setError(isLoginMode ? 'Email ama Password qalad ah.' : 'Email-kan mar hore ayaa la isticmaalay.');
      }
    } catch (err) {
      setError('Khalad ayaa dhacay. Fadlan isku day mar kale.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setError('');
      try {
          await loginWithGoogle();
          navigate('/profile');
      } catch (err) {
          setError('Google login failed.');
      }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col justify-center items-center p-4 relative overflow-hidden">
       {/* Background Decoration */}
       <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-200/20 rounded-full blur-3xl pointer-events-none"></div>

       <div className="bg-white/80 backdrop-blur-lg border border-white/50 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
             <div className="w-16 h-16 bg-emerald-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-900/20 text-white transform rotate-3">
                 <BookOpen className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-bold text-emerald-950 font-arabic tracking-wide">
                {isLoginMode ? 'Ku soo dhawow' : 'Sameyso Account'}
             </h2>
             <p className="text-stone-500 text-sm mt-1">
                {isLoginMode ? 'Gali account-kaaga si aad u sii wadato.' : 'Ku biir bulshada Quraanka.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
             {!isLoginMode && (
                <div className="relative group">
                   <User className="absolute left-3 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
                   <input 
                      type="text" 
                      placeholder="Magacaaga oo buuxa"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-stone-900 placeholder-stone-400"
                   />
                </div>
             )}
             
             <div className="relative group">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                   type="email" 
                   placeholder="Email address"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-stone-900 placeholder-stone-400"
                />
             </div>

             <div className="relative group">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-stone-400 group-focus-within:text-emerald-600 transition-colors" />
                <input 
                   type="password" 
                   placeholder="Password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-stone-900 placeholder-stone-400"
                />
             </div>

             {error && (
                <div className="text-rose-500 text-sm text-center bg-rose-50 py-2 rounded-lg font-medium animate-in slide-in-from-top-2">
                   {error}
                </div>
             )}

             <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-emerald-900 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/30 hover:bg-emerald-800 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                   <>
                      {isLoginMode ? 'Gal (Login)' : 'Diiwaan Gali'}
                      <ArrowRight className="w-5 h-5" />
                   </>
                )}
             </button>
          </form>

           {/* Divider */}
           <div className="flex items-center gap-4 my-6">
               <div className="h-px bg-stone-200 flex-1"></div>
               <span className="text-xs text-stone-400 font-medium uppercase tracking-wider">Ama</span>
               <div className="h-px bg-stone-200 flex-1"></div>
           </div>

           {/* Google Login Button */}
           <button 
               onClick={handleGoogleLogin}
               type="button"
               className="w-full py-3.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-bold shadow-sm hover:bg-stone-50 transition-all flex items-center justify-center gap-3 active:scale-95"
           >
               <svg className="w-5 h-5" viewBox="0 0 24 24">
                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
               </svg>
               Continue with Google
           </button>

          <div className="mt-8 text-center">
             <p className="text-stone-500 text-sm">
                {isLoginMode ? "Wali ma sameysan account? " : "Hadaad hore u lahayd account? "}
                <button 
                   onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setError('');
                   }}
                   className="text-emerald-700 font-bold hover:underline"
                >
                   {isLoginMode ? "Is-diiwaan gali" : "Soo gal"}
                </button>
             </p>
          </div>
       </div>
    </div>
  );
};

export default Login;
