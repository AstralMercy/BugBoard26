import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HomePage = () => {
  // Gestione della schermata attiva: 'dashboard', 'utenti', oppure 'dettaglio'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Stato per memorizzare quale issue è stata cliccata per vederne i dettagli (Punti 5 e 6)
  const [selectedIssue, setSelectedIssue] = useState(null);

  // --- STATI PER IL PUNTO 3 (Filtri e Ordinamento) ---
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('id');

  // Mock data delle Issue (Punto 2/3)
  const [issues, setIssues] = useState([
    { id: 'ISS-001', title: 'Errore validazione form registrazione', status: 'Open', priority: 'High', category: 'Frontend', desc: 'Il form accetta caratteri speciali non validi nel campo nome.' },
    { id: 'ISS-002', title: 'Connessione Database fallita in produzione', status: 'In Progress', priority: 'Critical', category: 'Backend', desc: 'Timeout dopo 30 secondi sul server cloud.' },
    { id: 'ISS-003', title: 'Migliorare responsive sidebar mobile', status: 'Closed', priority: 'Low', category: 'UI/UX', desc: 'La sidebar si sovrapponeva parzialmente su iPhone 13.' },
  ]);

  // Stato per i commenti dell'issue selezionata (Punto 5)
  const [comments, setComments] = useState([
    { id: 1, text: "Sto verificando i log del server.", author: "Luca S." },
    { id: 2, text: "Fix applicato in locale, pronto per la pull request.", author: "Mario R." }
  ]);
  const [newComment, setNewComment] = useState('');

  // Form di creazione utente dall'Admin (Punto 1)
  const [newUser, setNewUser] = useState({
    nome: '', cognome: '', username: '', email: '', password: '', role: 'normale'
  });

  // --- LOGICA DI FILTRAGGIO E ORDINAMENTO LIVE (Punto 3) ---
  const filteredIssues = issues
    .filter(issue => statusFilter === 'All' || issue.status === statusFilter)
    .filter(issue => priorityFilter === 'All' || issue.priority === priorityFilter)
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'priority') return a.priority.localeCompare(b.priority);
      return a.id.localeCompare(b.id); // Default ordina per ID
    });

  const handleIssueClick = (issue) => {
    setSelectedIssue(issue);
    setActiveTab('dettaglio');
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments([...comments, { id: Date.now(), text: newComment, author: "Admin User" }]);
    setNewComment('');
  };

  const handleNewUserChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    alert("Nuovo utente registrato con successo nel sistema!");
    setNewUser({ nome: '', cognome: '', username: '', email: '', password: '', role: 'normale' });
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1a1c] text-white flex flex-col overflow-hidden">
      <Navbar isLoggedIn={true} userName="Admin User" />

      <div className="flex flex-1 flex-col md:flex-row h-screen md:h-[calc(100vh-6rem)]">
        
        {/* SIDEBAR RESPONSIVE */}
        <aside className="w-full md:w-72 bg-[#2a2a2d] border-t md:border-t-0 md:border-r border-gray-800 p-6 flex md:flex-col shadow-xl order-2 md:order-1 overflow-x-auto md:overflow-x-hidden shrink-0">
          <nav className="flex md:flex-col items-center md:items-start gap-6 md:gap-10 w-full">
            <div className="md:w-full">
              <p className="hidden md:block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-6">Menu di Sistema</p>
              <ul className="flex md:flex-col gap-4 md:gap-5">
                <li 
                  onClick={() => { setActiveTab('dashboard'); setSelectedIssue(null); }}
                  className={`flex items-center gap-2 font-bold cursor-pointer transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'text-[#00c2cb]' : 'text-gray-400 hover:text-white'}`}
                >
                  {activeTab === 'dashboard' && <div className="w-1 h-4 bg-[#00c2cb] rounded-full hidden md:block"></div>}
                  Issues Dashboard
                </li>
                <li 
                  onClick={() => setActiveTab('utenti')}
                  className={`flex items-center gap-2 font-bold cursor-pointer transition-colors whitespace-nowrap ${activeTab === 'utenti' ? 'text-[#00c2cb]' : 'text-gray-400 hover:text-white'}`}
                >
                  {activeTab === 'utenti' && <div className="w-1 h-4 bg-[#00c2cb] rounded-full hidden md:block"></div>}
                  Gestione Utenti
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* PANNELLO CENTRALE DINAMICO */}
        <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-[#1a1a1c] order-1 md:order-2">
          <div className="max-w-7xl mx-auto">
            
            {/* SCHERMATA 1: DASHBOARD DELLE ISSUE (Punto 2 e 3) */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
                  <div>
                    <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Issues</h1>
                    <p className="text-gray-500 mt-2 font-medium">Usa i filtri per scorrere i bug o seleziona una riga per aprirla</p>
                  </div>
                  <Link to="/create-issue" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg transition-all transform active:scale-95">
                      + New Issue
                    </button>
                  </Link>
                </div>

                {/* --- BARRA DEI FILTRI RESPONSIVE (Punto 3 Requisito Minimo) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 bg-[#2a2a2d] p-4 rounded-2xl border border-gray-800/80">
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Filtra per Stato</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full p-3 bg-[#1a1a1c] border border-gray-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#00c2cb] cursor-pointer"
                    >
                      <option value="All">Tutti gli stati</option>
                      <option value="Open">Todo / Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Filtra per Priorità</label>
                    <select 
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full p-3 bg-[#1a1a1c] border border-gray-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#00c2cb] cursor-pointer"
                    >
                      <option value="All">Tutte le priorità</option>
                      <option value="Low">Low (Bassa)</option>
                      <option value="Medium">Medium (Media)</option>
                      <option value="High">High (Alta)</option>
                      <option value="Critical">Critical (Critica)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2">Ordina per</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-3 bg-[#1a1a1c] border border-gray-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#00c2cb] cursor-pointer"
                    >
                      <option value="id">ID Progressivo</option>
                      <option value="title">Descrizione (A-Z)</option>
                      <option value="priority">Livello Priorità</option>
                    </select>
                  </div>
                </div>

                {/* TABELLA ISSUE AGGIORNATA CON I DATI FILTRATI */}
                <div className="bg-[#2a2a2d] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-[#323235] border-b border-gray-800">
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Descrizione Issue</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stato</th>
                        <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Priorità</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {filteredIssues.length > 0 ? (
                        filteredIssues.map((issue) => (
                          <tr 
                            key={issue.id} 
                            onClick={() => handleIssueClick(issue)}
                            className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                          >
                            <td className="px-8 py-6 font-mono text-[#00c2cb] font-bold">{issue.id}</td>
                            <td className="px-8 py-6 font-bold text-gray-200 group-hover:text-white transition-colors">{issue.title}</td>
                            <td className="px-8 py-6">
                              <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                {issue.status}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-sm font-bold text-gray-300">● {issue.priority}</span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-10 text-center text-gray-500 font-bold text-sm uppercase tracking-wider">
                            Nessun bug corrisponde ai filtri selezionati
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SCHERMATA 2: GESTIONE UTENTI */}
            {activeTab === 'utenti' && (
              <div>
                <div className="mb-10">
                  <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Gestione Utenze</h1>
                  <p className="text-gray-500 mt-2 font-medium">Pannello amministratore per la registrazione organica di nuovi membri del team</p>
                </div>
                
                <div className="bg-[#2a2a2d] p-6 md:p-12 rounded-[2.5rem] border border-gray-800 max-w-3xl shadow-2xl">
                  <h2 className="text-xl font-black mb-8 text-[#00c2cb] uppercase tracking-wider">Crea Nuovo Account dipendente</h2>
                  
                  <form onSubmit={handleCreateUserSubmit} className="space-y-6 md:space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Nome *</label>
                        <input type="text" name="nome" required value={newUser.nome} onChange={handleNewUserChange} placeholder="NOME DIPENDENTE..." className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] text-sm md:text-base transition-all" />
                      </div>
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Cognome *</label>
                        <input type="text" name="cognome" required value={newUser.cognome} onChange={handleNewUserChange} placeholder="COGNOME DIPENDENTE..." className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] text-sm md:text-base transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Username *</label>
                        <input type="text" name="username" required value={newUser.username} onChange={handleNewUserChange} placeholder="USERNAME DI SISTEMA..." className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] text-sm md:text-base transition-all" />
                      </div>
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Email aziendale *</label>
                        <input type="email" name="email" required value={newUser.email} onChange={handleNewUserChange} placeholder="EMAIL UTENTE..." className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] text-sm md:text-base transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Password iniziale *</label>
                        <input type="password" name="password" required value={newUser.password} onChange={handleNewUserChange} placeholder="PASSWORD MINIMA 8 CARATTERI..." className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] text-sm md:text-base transition-all" />
                      </div>
                      <div>
                        <label className="block text-[#00c2cb] text-[10px] md:text-xs font-black mb-3 tracking-[0.2em] uppercase">Ruolo Privilegi *</label>
                        <select name="role" value={newUser.role} onChange={handleNewUserChange} className="w-full p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb] font-bold text-sm cursor-pointer">
                          <option value="normale">Utente Normale (Sviluppatore)</option>
                          <option value="admin">Amministratore (Admin)</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[#6495ED] hover:bg-[#5a86d6] text-[#1a1a1c] font-black uppercase text-sm tracking-widest rounded-xl shadow-lg transition-all transform active:scale-95 mt-4">
                      Registra Nuovo Utente
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* SCHERMATA 3: DETTAGLIO ISSUE, COMMENTI E STATO */}
            {activeTab === 'dettaglio' && selectedIssue && (
              <div className="space-y-8">
                <button onClick={() => setActiveTab('dashboard')} className="text-gray-400 hover:text-white font-bold text-sm uppercase tracking-wider">
                  ← Torna alla lista
                </button>
                
                <div className="bg-[#2a2a2d] p-6 md:p-10 rounded-[2.5rem] border border-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-gray-800 pb-6">
                    <div>
                      <span className="font-mono text-[#00c2cb] font-bold text-lg">{selectedIssue.id}</span>
                      <h2 className="text-2xl md:text-3xl font-black text-white uppercase mt-1">{selectedIssue.title}</h2>
                    </div>
                    
                    <div className="shrink-0">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cambia Stato</label>
                      <select defaultValue={selectedIssue.status} className="p-3 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white font-bold text-xs uppercase focus:outline-none focus:border-[#00c2cb]">
                        <option value="Open">Todo / Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-gray-300 font-medium leading-relaxed mb-8">{selectedIssue.desc}</p>

                  <div className="border-t border-gray-800 pt-8">
                    <h3 className="text-lg font-black uppercase tracking-wider mb-6 text-[#00c2cb]">Discussione / Commenti</h3>
                    
                    <div className="space-y-4 mb-6">
                      {comments.map((c) => (
                        <div key={c.id} className="bg-[#1a1a1c] p-4 rounded-xl border border-gray-800">
                          <p className="text-xs font-black text-[#6495ED] mb-1">{c.author}</p>
                          <p className="text-sm text-gray-300">{c.text}</p>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-4">
                      <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="SCRIVI UN AGGIORNAMENTO SUL BUG..." className="flex-1 p-4 bg-[#1a1a1c] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00c2cb]" />
                      <button type="submit" className="bg-[#00c2cb] text-[#1a1a1c] px-6 rounded-xl font-black uppercase text-xs tracking-widest">
                        Invia
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;