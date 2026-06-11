import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 h-20 md:h-24 bg-[#1a1a1c] border-b border-gray-800 w-full sticky top-0 z-50">
      
      {/* LOGO - Più piccolo su mobile (h-8) */}
      <div className="flex items-center shrink-0 z-10">
        <Link to={isLoggedIn ? "/home" : "/login"}>
          <img 
            src="/src/assets/BugBoard26.png" 
            alt="BugBoard26" 
            className="h-8 md:h-14 object-contain transition-transform" 
          />
        </Link>
      </div>

      {isLoggedIn && (
        <>
          {/* RICERCA - La rendiamo invisibile sotto i 450px o molto piccola */}
          <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-[140px] xs:max-w-[200px] sm:max-w-xs lg:max-w-xl">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cerca..."
                className="w-full py-2 pl-9 pr-2 bg-[#2a2a2d] border border-gray-700 rounded-lg text-[10px] md:text-base text-white focus:outline-none focus:border-[#00c2cb]"
              />
            </div>
          </div>

          {/* AREA UTENTE - Compatta per mobile */}
          <div className="flex items-center gap-2 md:gap-6 shrink-0 z-10">
            <div className="flex items-center gap-2 md:gap-4">
              
              {/* Nome utente: nascosto SEMPRE su mobile, appare solo da tablet (md) in su */}
              <span className="text-gray-200 font-bold text-sm md:text-lg hidden md:block">
                {userName || 'Admin'}
              </span>
              
              {/* Avatar: più piccolo su mobile */}
              <div className="w-8 h-8 md:w-12 md:h-12 bg-gray-700 rounded-full border border-gray-600 flex items-center justify-center text-[8px] md:text-xs text-gray-400 font-bold">
                 AV
              </div>

              {/* Logout: Solo testo piccolo su mobile */}
              <button 
                onClick={handleLogout}
                className="ml-1 md:ml-2 text-red-500 hover:text-red-400 font-black uppercase text-[9px] md:text-xs tracking-tighter md:tracking-widest transition-colors border-l border-gray-800 pl-2 md:pl-6"
              >
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;