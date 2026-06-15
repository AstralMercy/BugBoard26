import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  // --- LOGICA JAVASCRIPT ---
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Salviamo il token di sessione (Utile per i punti 1, 5, 6 della traccia)
        localStorage.setItem('token', data.token);
        navigate('/home'); 
      } else {
        alert("Errore di autenticazione: " + data.message);
      }
    } catch (error) {
      console.error("Errore connessione server:", error);
      // Fallback per i test locali grafici
      alert("Connessione simulata alla dashboard (Express non attivo).");
      navigate('/home');
    }
  };

  // --- INTERFACCIA GRAFICA UNIFICATA IN STILE HOMEPAGE XL ---
  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col justify-between overflow-y-auto">
      {/* Navbar in stato non loggato */}
      <Navbar isLoggedIn={false} />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        
        {/* Card di Login coordinata con l'ecosistema BugBoard26 */}
        <div className="w-full max-w-xl bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-800">
          
          {/* Header interno coordinato */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
              Sign In
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Inserisci le tue credenziali per accedere ai progetti attivi
            </p>
          </div>

          <form className="space-y-6 md:space-y-7" onSubmit={handleSubmit}>
            
            {/* Campo Email */}
            <div>
              <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                Email Utente *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="INSERISCI LA TUA EMAIL..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="INSERISCI LA PASSWORD..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
              />
            </div>

            {/* Bottone di Invio Solid ad alto contrasto */}
            <button
              type="submit"
              className="w-full py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black text-sm md:text-base rounded-xl shadow-lg shadow-[#6495ED]/10 transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Accedi
            </button>
          </form>

          {/* Link di reindirizzamento alla registrazione */}
          <div className="mt-8 text-center pt-6 border-t border-gray-800/60">
            <p className="text-gray-500 text-sm font-medium">
              Nuovo nel team? 
              <Link to="/register" className="text-[#6495ED] font-bold hover:text-[#5a86d6] ml-2 transition-colors">
                Crea un account
              </Link>
            </p>
          </div>

        </div>
      </main>
      
      {/* Piccolo spazio vuoto inferiore per bilanciare il flex-grow */}
      <div className="h-4"></div>
    </div>
  );
};

export default LoginPage;