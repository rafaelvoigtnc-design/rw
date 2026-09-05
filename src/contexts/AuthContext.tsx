'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, getIdToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserData } from '@/lib/firebase-auth';

interface UserData {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  cidade: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  token: string | null;
  setTokenValue: (token: string | null) => void;
  refreshUserData: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  token: null,
  setTokenValue: () => {},
  refreshUserData: async () => {},
  getToken: async () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setTokenState] = useState<string | null>(null);

  const refreshUserData = async () => {
    if (user) {
      console.log('Atualizando dados do usuário:', user.uid);
      const data = await getUserData(user.uid);
      console.log('Dados atualizados:', data);
      setUserData(data);
    }
  };

  const getToken = async () => {
    if (user) {
      try {
        const idToken = await getIdToken(user);
        console.log('Token obtido com sucesso');
        return idToken;
      } catch (error) {
        console.error('Erro ao obter token:', error);
        return null;
      }
    }
    return null;
  };

  const setTokenValue = (newToken: string | null) => {
    console.log('Setting token:', !!newToken);
    setTokenState(newToken);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser?.email || 'no user');
      setUser(currentUser);
      
      if (currentUser) {
        // Buscar dados adicionais do usuário
        console.log('Buscando dados do usuário:', currentUser.uid);
        const data = await getUserData(currentUser.uid);
        console.log('Dados do usuário encontrados:', data);
        console.log('Nome do usuário:', data?.nome);
        setUserData(data);
        
        // Obter token
        try {
          const idToken = await getIdToken(currentUser);
          setTokenState(idToken);
          console.log('Token obtido com sucesso');
        } catch (error) {
          console.error('Erro ao obter token:', error);
          setTokenState(null);
        }
      } else {
        setUserData(null);
        setTokenState(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, token, setTokenValue, refreshUserData, getToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}