import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Reader from './pages/Reader';
import Favorites from './pages/Favorites';
import Challenge from './pages/Challenge';
import DuaNotes from './pages/DuaNotes';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/reader" element={<Reader />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/challenge" element={<Challenge />} />
              <Route path="/dua" element={<DuaNotes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          <footer className="bg-stone-100 py-6 text-center text-stone-500 text-sm border-t border-stone-200 hidden md:block">
            <p>Janna App &copy; {new Date().getFullYear()}</p>
          </footer>
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;