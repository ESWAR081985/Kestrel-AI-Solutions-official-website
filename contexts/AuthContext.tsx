import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';
import { signJwt, verifyAndDecodeJwt } from '../utils/jwtUtils';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (role?: 'Admin' | 'Visitor', email?: string, name?: string, address?: string, location?: string, whatsapp?: string) => void;
  logout: () => void;
  updateUser: (updatedInfo: Partial<User>) => void;
  adminPassword?: string;
  recoveryPhrase?: string;
  updateAdminCredentials?: (newPassword: string) => void;
  regenerateRecoveryPhrase?: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A mock user for the simulated Google login
const mockUser: User = {
  id: '12345',
  name: 'Eshwar Ganta',
  email: 'eshwar@kestrelaisolutions.com',
  picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop', // A default picture
  role: 'Admin',
  address: 'DNO.10-259, Plot No.16, Visalakshi Nagar, Visakhapatnam, Andhra Pradesh, 530043',
  location: 'Visakhapatnam, Andhra Pradesh, India',
  whatsapp: '+91 8897226495',
  jobTitle: 'Founder & CEO',
  bio: 'Enterprise architect and systems developer at Kestrel AI Solutions, configuring automated intelligence pipelines.'
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    const saved = localStorage.getItem('kestrelAdminPassword');
    if (!saved || saved === 'KestrelAdmin2026!') {
      return 'Founder@2024';
    }
    return saved;
  });
  const [recoveryPhrase, setRecoveryPhraseState] = useState<string>(() => {
    return localStorage.getItem('kestrelRecoveryPhrase') || 'kestrel alpha secure gravity orbital hazard beacon trigger orbit system legacy delta';
  });

  const updateAdminCredentials = (newPassword: string) => {
    localStorage.setItem('kestrelAdminPassword', newPassword);
    setAdminPasswordState(newPassword);
  };

  const regenerateRecoveryPhrase = () => {
    const wordList = [
      'quantum', 'nebula', 'cipher', 'vortex', 'kestrel', 'matrix', 'beacon',
      'sentinel', 'pioneer', 'horizon', 'solace', 'vanguard', 'summit', 'aurora',
      'paradox', 'odyssey', 'pinnacle', 'zenith', 'catalyst', 'velocity', 'titan',
      'polaris', 'frontier', 'eclipse', 'secure', 'orbital', 'beacon', 'trigger'
    ];
    // Generate a beautiful 12 word recovery mnemonic
    const selected: string[] = [];
    for (let i = 0; i < 12; i++) {
      const idx = Math.floor(Math.random() * wordList.length);
      selected.push(wordList[idx]);
    }
    const newPhrase = selected.join(' ');
    localStorage.setItem('kestrelRecoveryPhrase', newPhrase);
    setRecoveryPhraseState(newPhrase);
    return newPhrase;
  };

  useEffect(() => {
    // Check for a saved user session in localStorage, prioritizing our safe JWT structure
    try {
      const savedToken = localStorage.getItem('kestrelToken');
      if (savedToken) {
        const decoded = verifyAndDecodeJwt(savedToken);
        if (decoded) {
          setUser({
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
            role: decoded.role,
            address: decoded.address,
            location: decoded.location,
            whatsapp: decoded.whatsapp,
            jobTitle: decoded.jobTitle,
            bio: decoded.bio
          });
          setToken(savedToken);
          console.log(`[JWT Verification] Active session successfully restored for ${decoded.name} (${decoded.role}) via checked token signature.`);
        } else {
          console.warn('[JWT Verification] Stored token was invalid or expired. Purging session.');
          localStorage.removeItem('kestrelToken');
          localStorage.removeItem('kestrelUser');
        }
      } else {
        // Fallback or legacy session migration path
        const savedUserJSON = localStorage.getItem('kestrelUser');
        if (savedUserJSON) {
          const legacyUserObj = JSON.parse(savedUserJSON);
          // Auto-upgrade legacy session to a secure signed JWT containing their role!
          const generatedToken = signJwt(legacyUserObj);
          localStorage.setItem('kestrelToken', generatedToken);
          setToken(generatedToken);
          setUser(legacyUserObj);
          console.log('[JWT Migration] Migrating existing plain session to cryptographically secure signed JWT.');
        }
      }
    } catch (error) {
      console.error("Failed to restore JWT user session from localStorage.", error);
      localStorage.removeItem('kestrelToken');
      localStorage.removeItem('kestrelUser');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (
    role: 'Admin' | 'Visitor' = 'Admin', 
    email?: string, 
    name?: string,
    address?: string,
    location?: string,
    whatsapp?: string
  ) => {
    try {
      const newUser: User = {
        id: role === 'Admin' ? mockUser.id : 'guest_' + Math.random().toString(36).substring(2, 11),
        name: name || (role === 'Admin' ? mockUser.name : 'Guest Visitor'),
        email: email || (role === 'Admin' ? mockUser.email : 'visitor@kestrel.ai'),
        picture: role === 'Admin' 
          ? mockUser.picture
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop',
        role: role,
        address: role === 'Admin' ? mockUser.address : address,
        location: role === 'Admin' ? mockUser.location : location,
        whatsapp: role === 'Admin' ? mockUser.whatsapp : whatsapp,
        jobTitle: role === 'Admin' ? mockUser.jobTitle : 'External Reviewer',
        bio: role === 'Admin' ? mockUser.bio : 'Guest visitor reviewing company and dashboard assets.'
      };
      const userToSave = { ...newUser, picture: newUser.picture + `&${Date.now()}` }; // Add timestamp to default pic to avoid caching issues on first load
      
      // Generate standard JWT on key sign-off containing user data schema & active roles
      const secureToken = signJwt(userToSave);
      
      // Store standard JWT secure parameter in local storage
      localStorage.setItem('kestrelToken', secureToken);
      localStorage.setItem('kestrelUser', JSON.stringify(userToSave)); // Keep basic mirror in sync for legacy code paths
      
      setToken(secureToken);
      setUser(userToSave);
      console.log(`[JWT Gateway] Signed new validated token for ${userToSave.name} (${userToSave.role}).`);
    } catch (error) {
      console.error("Failed to save and sign user inside secure storage.", error);
      alert("Could not log in due to a token allocation failure.");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('kestrelToken');
      localStorage.removeItem('kestrelUser');
      localStorage.removeItem('lastVisitorName');
      localStorage.removeItem('lastVisitorEmail');
      setToken(null);
      setUser(null);
      console.log(`[JWT Gateway] Session securely purged & token invalidated.`);
    } catch (error) {
      console.error("Failed to clear secure token records.", error);
    }
  };
  
  const updateUser = (updatedInfo: Partial<User>) => {
    if (!user) return;
    const updatedUserObj = { ...user, ...updatedInfo };
    try {
      // Re-sign token with upgraded profile payloads
      const newSecureToken = signJwt(updatedUserObj);
      localStorage.setItem('kestrelToken', newSecureToken);
      localStorage.setItem('kestrelUser', JSON.stringify(updatedUserObj));
      
      setToken(newSecureToken);
      setUser(updatedUserObj);
      alert('Profile updated and JWT claims re-signed successfully!');
    } catch (error) {
      console.error("Failed to update user payload claims in secure storage.", error);
      alert("Could not save profile changes due to a re-signing failure.");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading, 
      login, 
      logout, 
      updateUser,
      adminPassword,
      recoveryPhrase,
      updateAdminCredentials,
      regenerateRecoveryPhrase
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
