import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ isLoggedIn, userName }) => {
  const navigate = useNavigate();

  // Recuperiamo l'oggetto utente completo per estrarre Nome e Cognome reali
  const loggedUser = JSON.parse(localStorage.getItem('user')) || {};

  const handleLogout = () => {
    // Pulisce la sessione e reindirizza al login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // --- LOGICA ESTRATTIVA PER LE INIZIALI ---
  const getInitials = () => {
    if (loggedUser.nome && loggedUser.cognome) {
      return `${loggedUser.nome[0]}${loggedUser.cognome[0]}`.toUpperCase();
    }
    if (userName) {
      return userName.slice(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    /* RIDOTTA ALTEZZA A h-16 E PADDING VERTICALE A py-3 */
    <nav className="bg-[#2a2a2d] border-b border-gray-800 px-6 py-3 flex justify-between items-center h-16 shrink-0 shadow-md">
      
      {/* BRAND LOGO (Pallino rimosso) */}
      <div className="flex items-center gap-3">
        <span className="text-lg font-black uppercase tracking-widest italic text-white">
          BugBoard<span className="text-[#00c2cb]">26</span>
        </span>
      </div>

      {/* BLOCCO PROFILO E LOGOUT */}
      {isLoggedIn && (
        <div className="flex items-center gap-4">
          
          {/* Dettagli testuali dell'utente (Invisibili su smartphone piccoli) */}
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white">
              {loggedUser.nome && loggedUser.cognome 
                ? `${loggedUser.nome} ${loggedUser.cognome}` 
                : userName}
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider text-[#00c2cb]">
              {loggedUser.role === 'admin' ? '🛡️ Admin' : '💻 Developer'}
            </span>
          </div>

          {/* CERCHIO DINAMICO OTTIMIZZATO A w-10 h-10 PER IL NUOVO LAYOUT COMPATTO */}
          <div className="w-10 h-10 rounded-full bg-[#6495ED] text-[#1a1a1c] flex items-center justify-center font-black text-xs border border-gray-700/50 shadow-lg select-none tracking-tighter">
            {getInitials()}
          </div>

          {/* PULSANTE LOGOUT SNELLIRO CON PY-2 E PX-3 */}
          <button 
            onClick={handleLogout}
            className="ml-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-xl border border-red-500/20"
          >
            Logout
          </button>

        </div>
      )}
    </nav>
  );
};

export default Navbar;