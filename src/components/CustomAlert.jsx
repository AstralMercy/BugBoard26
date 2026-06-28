import React from 'react';

const CustomAlert = ({ isOpen, message, type = 'success', onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const themeColor = isSuccess ? '#00c2cb' : '#ef4444';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1a1a1c]/80 backdrop-blur-md transition-all duration-200">
      
      {/* CORPO DEL POPUP PULITO SENZA HEADER ROW */}
      <div className="bg-[#2a2a2d] border-2 border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {/* TITOLO IN STILE INTESTAZIONE HOMEPAGE (UPPERCASE + ITALIC) */}
        <h2 
          className="text-xl md:text-2xl font-black uppercase tracking-tight italic"
          style={{ color: themeColor }}
        >
          {isSuccess ? 'Operazione Riuscita' : 'Azione Interrotta'}
        </h2>

        {/* TESTO DEL MESSAGGIO */}
        <p className="text-gray-300 font-medium text-sm leading-relaxed mt-4 mb-8">
          {message}
        </p>

        {/* BOTTONE INTEGRATO CON GLI STILI DEL PROGETTO */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest text-[#1a1a1c] transition-all transform active:scale-95 hover:opacity-90"
          style={{ backgroundColor: themeColor }}
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;