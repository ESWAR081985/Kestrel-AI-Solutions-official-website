
import React, { useState, useEffect, useRef } from 'react';
import { HeaderProps } from '../types';
import { KestrelLogoIcon, LogoutIcon, UserIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { fileToDataUrl, resizeImage } from '../utils/imageUtils';

export const GoogleColoredBrandName: React.FC = () => {
  return (
    <span className="font-display font-black text-xl md:text-2xl tracking-tight select-none bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] bg-clip-text text-transparent drop-shadow-sm transition-all duration-350 hover:brightness-110 active:scale-[0.99] shrink-0">
      Kestrel AI Solutions
    </span>
  );
};

const Header: React.FC<HeaderProps> = ({ navigation, onNavigate }) => {
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanName = (name?: string) => {
    if (!name) return '';
    return name.split('(')[0].trim();
  };

  useEffect(() => {
    try {
        const savedLogo = localStorage.getItem('companyLogo');
        if (savedLogo) {
          setLogo(savedLogo);
        }
    } catch (error) {
        console.error("Failed to load company logo from localStorage.", error);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAdmin = user?.role === 'Admin';
    if (!isAdmin) {
      alert("Only an Administrator can edit or change the company logo.");
      return;
    }

    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        try {
            const base64String = await fileToDataUrl(file);
            // Resize logo to a reasonable size to prevent storage issues
            const resizedLogo = await resizeImage(base64String, 256, 256, 0.9);
            
            localStorage.setItem('companyLogo', resizedLogo);
            setLogo(resizedLogo);
        } catch (error) {
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                alert('Storage limit reached. Could not save the new logo. Please try a smaller image.');
            } else {
                console.error("Failed to process logo image:", error);
                alert("There was an error processing your logo. Please try again.");
            }
        } finally {
            if (event.target) event.target.value = '';
        }
    }
  };

  const triggerFileUpload = () => {
    const isAdmin = user?.role === 'Admin';
    if (!isAdmin) {
      return;
    }
    fileInputRef.current?.click();
  };
  
  const handleNavigation = (name: string) => {
      onNavigate(name);
      setIsMenuOpen(false);
  }

  const isAdmin = user?.role === 'Admin';

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-[1650px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoUpload}
              className="hidden"
              accept="image/*"
              aria-hidden="true"
            />
            {/* Custom Logo / Default Fallback */}
            {isAdmin ? (
              <button 
                onClick={triggerFileUpload} 
                className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kestrel-blue cursor-pointer group relative flex items-center gap-2 shrink-0"
                aria-label="Upload company logo"
                title="Admin: Click to upload custom logo"
              >
                {logo ? (
                  <img src={logo} alt="Company Logo" className="max-h-12 w-auto object-contain transition-opacity group-hover:opacity-85" />
                ) : (
                  <KestrelLogoIcon className="h-12 w-12 text-kestrel-blue transition-colors group-hover:text-indigo-650 shrink-0" />
                )}
                <GoogleColoredBrandName />
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white font-bold text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-wider">Change logo</span>
              </button>
            ) : (
              <div 
                className="p-1 rounded-md flex items-center gap-2 shrink-0"
                aria-label="Company logo"
              >
                {logo ? (
                  <img src={logo} alt="Company Logo" className="max-h-12 w-auto object-contain" />
                ) : (
                  <KestrelLogoIcon className="h-12 w-12 text-kestrel-blue shrink-0" />
                )}
                <GoogleColoredBrandName />
              </div>
            )}
          </div>
          <nav className="hidden md:flex space-x-8">
            {navigation.filter(item => {
              if (item.name === 'Profile' || item.name === 'Login' || item.name === 'Settings') return false;
              const isAdmin = user && user.role === 'Admin';
              if (!isAdmin) {
                return item.name === 'Home' || item.name === 'About Us' || item.name === 'Contact Us' || item.name === 'Projects' || item.name === 'Customer Portal';
              }
              return true;
            }).map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.name);
                }}
                className={`text-base font-medium py-1 cursor-pointer ${
                  item.current
                    ? 'text-kestrel-active-nav border-b-2 border-kestrel-active-nav'
                    : 'text-kestrel-nav-text hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
                aria-current={item.current ? 'page' : undefined}
              >
                {item.name}
              </a>
            ))}
          </nav>
          <div className="flex items-center">
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  <span className="text-kestrel-nav-text text-base font-medium hidden sm:block">
                    {cleanName(user.name)} <span className="ml-1 px-1.5 py-0.5 text-[9px] bg-indigo-50 text-indigo-700 rounded-md font-bold uppercase">{user.role}</span>
                  </span>
                  <img className="h-9 w-9 rounded-full object-cover" src={user.picture} alt="User profile" />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900" role="none">
                          {cleanName(user.name)}
                        </p>
                        <p className="text-sm text-gray-500 truncate" role="none">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleNavigation('Profile')}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserIcon className="w-5 h-5 text-gray-500"/>
                        Your Profile
                      </button>
                      {user.role === 'Admin' && (
                        <button
                          onClick={() => handleNavigation('Settings')}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-150"
                        >
                          <svg className="w-5 h-5 text-gray-550" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Settings
                        </button>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogoutIcon className="w-5 h-5 text-gray-500"/>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('Login')}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 font-bold text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m11 16-4-4m0 0 4-4m-4 4h14m-5 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v1" />
                </svg>
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
