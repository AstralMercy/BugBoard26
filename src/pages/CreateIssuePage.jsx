import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CustomAlert from '../components/CustomAlert'; // Inserito solo l'import

const CreateIssuePage = () => {
  const navigate = useNavigate();
  
  // --- STATI DEL FORM (Punto 2) ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('bug'); // bug, question, documentation, feature
  const [priority, setPriority] = useState('Low'); // Low, Medium, High, Critical
  const [image, setImage] = useState(null); // File binario dello screenshot
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATO PER IL POPUP PERSONALIZZATO ---
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, message: '', type: 'success' });

  const triggerAlert = (message, type = 'success') => {
    setAlertConfig({ isOpen: true, message, type });
  };

  const token = localStorage.getItem('token');
  const loggedUser = JSON.parse(localStorage.getItem('user')) || { username: 'Ospite' };

  // Sicurezza: blocca l'accesso alla pagina se non si è loggati
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Gestore del cambio file per lo screenshot
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  // --- INVIO FORM CON FORMDATA A EXPRESS + NEONDB (Punto 2) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      triggerAlert("Titolo e descrizione sono obbligatori!", 'error'); // Sostituito alert
      return;
    }

    setIsSubmitting(true);

    // Creiamo il contenitore FormData per supportare l'upload del file binario
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('priority', priority);
    
    // Se l'utente ha allegato uno screenshot, lo inseriamo nel pacchetto
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        headers: {
          // NOTA: Non inseriamo 'Content-Type'! Il browser lo imposta da solo con i boundary corretti.
          'Authorization': `Bearer ${token}` // Autentichiamo la richiesta con il JWT
        },
        body: formData // Inviamo il FormData al posto del JSON.stringify
      });

      if (response.ok) {
        triggerAlert("Bug segnalato e salvato correttamente", 'success'); // Sostituito alert
        setTimeout(() => navigate('/home'), 1500); // Ritorniamo alla dashboard con un piccolo delay per far vedere il popup
      } else {
        const errorData = await response.json();
        triggerAlert("Errore durante il salvataggio: " + errorData.message, 'error'); // Sostituito alert
      }
    } catch (error) {
      console.error("Errore di rete:", error);
      triggerAlert("Impossibile raggiungere il server di backend.", 'error'); // Sostituito alert
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col">
      <Navbar isLoggedIn={true} userName={loggedUser.username} />

      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          
          {/* LINK DI RITORNO */}
          <Link to="/home" className="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider block mb-8 transition-colors">
            ← Annulla e torna alla Dashboard
          </Link>

          {/* INTESTAZIONE */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">New Issue</h1>
            <p className="text-gray-500 mt-2 font-medium">Inserisci i dettagli della issue</p>
          </div>

          {/* SCHEDA DEL FORM COMPLETO */}
          <div className="bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] border border-gray-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* TITOLO / COSA NON FUNZIONA */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Titolo Breve / Sintesi del Disservizio
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="ES. ERRORE 500 SUL SALVATAGGIO DEL PROFILO..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white font-medium focus:outline-none focus:border-[#00c2cb] placeholder-gray-600 transition-colors text-sm"
                />
              </div>

              {/* SELEZIONE CATEGORIA E PRIORITÀ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    Tipologia Segnalazione
                  </label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#00c2cb]"
                  >
                    <option value="bug">Bug (Errore di codice)</option>
                    <option value="feature">Feature Request (Nuova idea)</option>
                    <option value="documentation">Documentation (Testi/Manuali)</option>
                    <option value="question">Question (Dubbi/Domande)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                    Livello di Urgenza / Priorità
                  </label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-[#00c2cb]"
                  >
                    <option value="Low">Low (Bassa)</option>
                    <option value="Medium">Medium (Media)</option>
                    <option value="High">High (Alta)</option>
                    <option value="Critical">Critical (Bloccante)</option>
                  </select>
                </div>
              </div>

              {/* DESCRIZIONE DETTAGLIATA */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Descrizione Dettagliata
                </label>
                <textarea 
                  required
                  rows="5"
                  placeholder="DESCRIVI IL COMPORTAMENTO ANOMALO E COSA DOVREBBE SUCCEDERE INVECE..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white font-medium focus:outline-none focus:border-[#00c2cb] placeholder-gray-600 transition-colors text-sm resize-none"
                ></textarea>
              </div>

              {/* CARICAMENTO FILE IMMAGINE (Punto 2) */}
              <div className="border-t border-gray-800/60 pt-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Carica Screenshot Allegato (Opzionale)
                </label>
                <div className="bg-[#1a1a1c] p-4 rounded-xl border border-gray-700/80 flex flex-col sm:flex-row items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-[#323235] file:text-white hover:file:bg-[#3c3c40] file:cursor-pointer"
                  />
                  {image && (
                    <span className="text-xs text-[#00c2cb] font-bold shrink-0">
                      ✓ Pronto per l'upload
                    </span>
                  )}
                </div>
              </div>

              {/* PULSANTE DI SALVATAGGIO */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black uppercase text-sm tracking-widest rounded-xl shadow-lg disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "Salvataggio della segnalazione in corso..." : "Invia Segnalazione"}
              </button>

            </form>
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

export default CreateIssuePage;