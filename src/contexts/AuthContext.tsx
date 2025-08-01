import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

const COMPANY_DOMAIN = 'votre-entreprise.com'; // À remplacer par votre domaine

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const savedUser = localStorage.getItem('qr_attendance_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Simulation de l'authentification Google
      // En production, vous utiliseriez la vraie API Google OAuth
      const mockUser = {
        id: '1',
        email: `test@${COMPANY_DOMAIN}`,
        name: 'Utilisateur Test',
        picture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150'
      };

      // Vérifier le domaine de l'email
      if (!mockUser.email.endsWith(`@${COMPANY_DOMAIN}`)) {
        throw new Error('Seuls les comptes de l\'entreprise sont autorisés');
      }

      setUser(mockUser);
      localStorage.setItem('qr_attendance_user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('qr_attendance_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}