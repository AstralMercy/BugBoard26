import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CreateIssuePage = () => {
  const navigate = useNavigate();

  // Stato per raccogliere tutti i dati richiesti dal Punto 2 della traccia
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bug', // Valore di default
    priority: 'Medium', // Valore di default
    image: null
  });

  // Gestore per i campi testuali e select
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Gestore specifico per il caricamento dell'immagine (File)
  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  // Funzione per inviare i dati, predisposta per il backend Express
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Quando si inviano file (immagini), in JavaScript si usa FormData al posto del JSON nativo
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    dataToSend.append('type', formData.type);
    dataToSend.append('priority', formData.priority);
    if (formData.image) {
      dataToSend.append('image', formData.image);
    }

    try {
      console.log("Inviando nuova Issue...", formData);
      
      const response = await fetch('http://localhost:5000/api/issues', {
        method: 'POST',
        // NOTA: Con FormData non bisogna impostare l'header 'Content-Type', lo fa il browser da solo
        body: dataToSend,
      });

      if (response.ok) {
        alert("Issue creata con successo! Inizialmente impostata su stato 'todo'.");
        navigate('/home'); // Ritorna alla dashboard
      } else {
        alert("Errore durante la creazione dell'issue.");
      }
    } catch (error) {
      console.error("Errore connessione backend:", error);
      // Simulazione di successo locale se il backend è spento per fare i test grafici
      alert("Backend non raggiungibile. Reindirizzamento simulato alla Home.");
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col">
      <Navbar isLoggedIn={true} userName="Admin User" />

      <main className="flex-grow flex flex-col items-center p-4 md:p-10 overflow-y-auto">
        <div className="w-full max-w-3xl bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] border border-gray-800 shadow-2xl mt-4">
          
          {/* Header del Form */}
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">Create New Issue</h1>
            <p className="text-sm text-gray-500 mt-1">Inserisci i dettagli per segnalare un nuovo bug o attività nel sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            
            {/* Titolo dell'issue */}
            <div>
              <label className="block text-[#00c2cb] text-xs md:text-sm font-black mb-3 tracking-[0.2em] uppercase">Titolo Issue *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="ES. ERRORE NELLA VALIDAZIONE DEI DATI..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] transition-all"
              />
            </div>

            {/* Grid Responsive per Tipologia e Priorità */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tipologia Issue (Punto 2) */}
              <div>
                <label className="block text-[#00c2cb] text-xs md:text-sm font-black mb-3 tracking-[0.2em] uppercase">Tipologia *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] cursor-pointer"
                >
                  <option value="bug">Bug (Malfunzionamento)</option>
                  <option value="question">Question (Chiarimento)</option>
                  <option value="documentation">Documentation (Problema Doc)</option>
                  <option value="feature">Feature (Nuova Funzionalità)</option>
                </select>
              </div>

              {/* Priorità */}
              <div>
                <label className="block text-[#00c2cb] text-xs md:text-sm font-black mb-3 tracking-[0.2em] uppercase">Priorità *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] cursor-pointer"
                >
                  <option value="Low">Low (Bassa)</option>
                  <option value="Medium">Medium (Media)</option>
                  <option value="High">High (Alta)</option>
                  <option value="Critical">Critical (Critica)</option>
                </select>
              </div>
            </div>

            {/* Descrizione Estesa */}
            <div>
              <label className="block text-[#00c2cb] text-xs md:text-sm font-black mb-3 tracking-[0.2em] uppercase">Descrizione Dettagliata *</label>
              <textarea
                name="description"
                required
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="DESCRIVI IL COMPORTAMENTO RISCONTRATO E I PASSI PER RIPRODURLO..."
                className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] transition-all resize-none"
              ></textarea>
            </div>

            {/* Upload Immagine (Opzionale) */}
            <div>
              <label className="block text-[#00c2cb] text-xs md:text-sm font-black mb-3 tracking-[0.2em] uppercase">Allegato Immagine (Opzionale)</label>
              <div className="w-full p-4 bg-[#1a1a1c] border border-dashed border-gray-700 rounded-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-[#2a2a2d] file:text-white hover:file:bg-[#3a3a3d] file:cursor-pointer cursor-pointer w-full sm:w-auto"
                />
                {formData.image && <span className="text-xs text-[#00c2cb] font-bold truncate max-w-xs">{formData.image.name}</span>}
              </div>
            </div>

            {/* Pulsanti Azione */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                className="w-full sm:flex-1 py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black uppercase text-sm tracking-widest rounded-xl transition-all shadow-lg active:scale-95"
              >
                Invia Segnalazione
              </button>
              <button
                type="button"
                onClick={() => navigate('/home')}
                className="w-full sm:w-auto px-8 py-4 bg-[#1a1a1c] border border-gray-700 text-gray-400 hover:text-white font-black uppercase text-sm tracking-widest rounded-xl transition-all"
              >
                Annulla
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateIssuePage;