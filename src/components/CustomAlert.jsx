import React from 'react';

const CustomAlert = ({ isOpen, message, type = 'success', onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const themeColor = isSuccess ? '#00c2cb' : '#ef4444';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#1a1a1c]/80 backdrop-blur-md transition-all duration-200">
      
      {/* CORPO DEL POPUP STRUTTURATO COME I TUOI PANNELLI */}
      <div className="bg-[#2a2a2d] border-2 border-gray-800 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {/* TOP BAR IN STILE TERMINALE / CORE DI SISTEMA */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Il pallino pulsante abbinato alla tua Navbar */}
            <div 
              className="w-2.5 h-2.5 rounded-full animate-pulse" 
              style={{ backgroundColor: themeColor }}
            ></div>
            <span className="font-mono text-[10px] font-black tracking-[0.3em] text-gray-500 uppercase">
              {isSuccess ? 'SYS::STATUS_OK' : 'SYS::EXEC_ERROR'}
            </span>
          </div>
          <span className="font-mono text-[9px] font-bold text-gray-600 bg-[#1a1a1c] px-2 py-0.5 rounded-md border border-gray-800">
            {isSuccess ? 'CODE_201' : 'CODE_400'}
          </span>
        </div>

        {/* TITOLO IN STILE INTESTAZIONE HOMEPAGE (UPPERCASE + ITALIC) */}
        <h2 
          className="text-xl md:text-2xl font-black uppercase tracking-tight italic"
          style={{ color: themeColor }}
        >
          {isSuccess ? 'Operazione Riuscita' : 'Azione Interrotta'}
        </h2>

        {/* TESTO DEL MESSAGGIO SUL TUO FONT REGOLARE */}
        <p className="text-gray-300 font-medium text-sm leading-relaxed mt-3 mb-8">
          {message}
        </p>

        {/* BOTTONE INTEGRATO CON GLI STILI DEL PROGETTO */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] text-[#1a1a1c] transition-all transform active:scale-95 shadow-lg"
          style={{ 
            backgroundColor: themeColor,
            color: '#1a1a1c'
          }}
        >
          Chiudi Terminale
        </button>

      </div>
    </div>
  );
};

export default CustomAlert;