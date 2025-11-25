
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  photoUrl?: string; // Added for Google Profile Pic
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    const storedUser = localStorage.getItem('quran_app_current_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersStr = localStorage.getItem('quran_app_users_db');
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    const foundUser = users.find(u => u.email === email && u.password === pass);
    
    if (foundUser) {
      const { password, ...userWithoutPass } = foundUser;
      setUser(userWithoutPass);
      localStorage.setItem('quran_app_current_user', JSON.stringify(userWithoutPass));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const usersStr = localStorage.getItem('quran_app_users_db');
    const users: any[] = usersStr ? JSON.parse(usersStr) : [];
    
    if (users.find(u => u.email === email)) {
      return false; // User exists
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: pass,
      joinedDate: new Date().toLocaleDateString('so-SO')
    };
    
    const updatedUsers = [...users, newUser];
    localStorage.setItem('quran_app_users_db', JSON.stringify(updatedUsers));
    
    const { password, ...userWithoutPass } = newUser;
    setUser(userWithoutPass);
    localStorage.setItem('quran_app_current_user', JSON.stringify(userWithoutPass));
    
    return true;
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simulate Google Login Delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const googleUser: User = {
        id: 'google-' + Date.now(),
        name: 'Muslim User',
        email: 'user@gmail.com',
        joinedDate: new Date().toLocaleDateString('so-SO'),
        photoUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c' // Placeholder Google Image
    };

    setUser(googleUser);
    localStorage.setItem('quran_app_current_user', JSON.stringify(googleUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quran_app_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
