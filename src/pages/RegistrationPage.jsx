import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert'; // Inserito solo l'import

const RegistrationPage = () => {
  // --- LOGICA JAVASCRIPT ---
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    username: '',
    email: '',
    password: ''
  });

  const navigate = useNavigate();

  // --- STATO PER IL POPUP PERSONALIZZATO ---
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'success' });

  const triggerAlert = (message, type = 'success') => {
    setAlertConfig({ isOpen: true, message, type });
  };

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
      // Nota il percorso aggiornato /api/auth/register
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        triggerAlert("Registrazione avvenuta con successo! Ora puoi effettuare l'accesso.", 'success'); // Sostituito alert
        setTimeout(() => navigate('/login'), 1500); // Mandiamo al login dopo un piccolo delay per mostrare il popup
      } else {
        triggerAlert("Errore dal server: " + data.message, 'error'); // Sostituito alert
      }
    } catch (error) {
      console.error("Errore di connessione:", error);
      triggerAlert("Impossibile connettersi al server. Assicurati che Express sia attivo.", 'error'); // Sostituito alert
    }
  };

  // --- INTERFACCIA GRAFICA AGGIORNATA IN STILE HOMEPAGE XL ---
  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col overflow-y-auto">
      {/* Navbar in stato non loggato */}
      <Navbar isLoggedIn={false} />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-10 md:py-16">
        
        {/* Card di Registrazione unificata con lo stile dell'applicazione */}
        <div className="w-full max-w-2xl bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-800">
          
          {/* Header interno alla card coordinato */}
          <div className="mb-10 text-left">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">
              Registration
            </h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">
              Crea il tuo profilo ed entra nel workspace di BugBoard26
            </p>
          </div>

          <form className="space-y-6 md:space-y-7" onSubmit={handleSubmit}>
            
            {/* GRIGLIA RESPONSIVE: Nome & Cognome */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Nome */}
              <div>
                <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="IL TUO NOME..."
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
                />
              </div>

              {/* Campo Cognome */}
              <div>
                <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="cognome"
                  required
                  value={formData.cognome}
                  onChange={handleChange}
                  placeholder="IL TUO COGNOME..."
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
                />
              </div>
            </div>

            {/* GRIGLIA RESPONSIVE: Username & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo Username */}
              <div>
                <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                  Username *
                </label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="SCEGLI UN USERNAME..."
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
                />
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="EMAIL..."
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
                />
              </div>
            </div>

            {/* Campo Password (Intero a schermo) */}
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
                placeholder="PASSWORD..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] focus:ring-1 focus:ring-[#00c2cb] placeholder-gray-600 text-sm md:text-base transition-all"
              />
            </div>

            {/* Bottone di Invio in stile Dashboard */}
            <button
              type="submit"
              className="w-full py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black text-sm md:text-base rounded-xl shadow-lg shadow-[#6495ED]/10 transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Registrati
            </button>
          </form>

          {/* Link per il Login rivisitato */}
          <div className="mt-8 text-center pt-6 border-t border-gray-800/60">
            <p className="text-gray-500 text-sm font-medium">
              Hai già un account? 
              <Link to="/login" className="text-[#6495ED] font-bold hover:text-[#5a86d6] ml-2 transition-colors">
                Accedi
              </Link>
            </p>
          </div>

        </div>
      </main>

      {/* COMPONENTE ALERT INSERITO CORRETTAMENTE IN FONDO */}
      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />
    </div>
  );
};

export default RegistrationPage;