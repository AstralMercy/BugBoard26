import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert'; // Inserito solo l'import

const LoginPage = () => {
  // --- LOGICA JAVASCRIPT ---
  const [formData, setFormData] = useState({
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
      // Nota il percorso aggiornato /api/auth/login coerente con Express
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Salviamo il Token JWT e le info utente nella memoria del browser
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Entra direttamente senza mostrare il popup di successo
        navigate('/home'); 
      } else {
        // Mostra il popup personalizzato in caso di errore di credenziali
        triggerAlert("Errore di autenticazione: " + data.message, 'error');
      }
    } catch (error) {
      console.error("Errore connessione server:", error);
      // Mostra il popup personalizzato in caso di errore di rete
      triggerAlert("Impossibile connettersi al backend. Assicurati che Express sia acceso sulla porta 5000.", 'error');
    }
  };

  // --- INTERFACCIA GRAFICA UNIFICATA IN STILE HOMEPAGE XL ---
  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col justify-between overflow-y-auto">
      {/* Navbar in stato non loggato */}
      <Navbar isLoggedIn={false} />

      <main className="grow flex flex-col items-center justify-center px-4 py-12">
        
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

        </div>
      </main>
      
      {/* Piccolo spazio vuoto inferiore per bilanciare il flex-grow */}
      <div className="h-4"></div>

      {/* COMPONENTE ALERT INSERITO SENZA TOCCARE IL DESIGN ORIGINALE */}
      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />
    </div>
  );
};

export default LoginPage;
