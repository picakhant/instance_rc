import { useState } from 'react';

export default function PromptModal({ isOpen, onClose, onConfirm }) {
  const [sessionInput, setSessionInput] = useState('Class_1');

  if (!isOpen) return null;

  const handleConfirm = () => {
    const sessionName = sessionInput.trim() || "Unknown_Class";
    onConfirm(sessionName);
  };

  return (
    // font-mono နဲ့ backdrop-blur သုံးပြီး နောက်ခံကို အနည်းငယ် ဝါးထားပါတယ်
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-mono">
      
      {/* Modal Box - Dark Theme */}
      <div className="bg-gray-900 p-6 rounded border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)] w-96 relative overflow-hidden">
        
        {/* ခေါင်းစဉ်ပိုင်း */}
        <h3 className="text-xl font-bold text-green-400 mb-4 tracking-wider flex items-center gap-2">
          <span className="text-gray-500">~/</span> session_config.sh
        </h3>
        
        <p className="text-sm text-gray-400 mb-4">
          <span className="text-green-500">{'>_'}</span> အတန်းအမည် သို့မဟုတ် အချိန်ကို ထည့်ပါ (ဥပမာ - JS_Section_A):
        </p>
        
        {/* Terminal Input ပုံစံ */}
        <div className="relative mb-6">
          <span className="absolute left-3 top-2.5 text-green-500 font-bold">{'$'}</span>
          <input 
            type="text" 
            value={sessionInput}
            onChange={(e) => setSessionInput(e.target.value)}
            className="w-full bg-black border border-gray-700 text-green-400 p-2 pl-8 rounded focus:outline-none focus:border-green-500 focus:shadow-[0_0_10px_rgba(34,197,94,0.2)] transition-all"
            autoFocus
          />
        </div>
        
        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 border border-transparent hover:border-red-500/30 rounded transition-colors uppercase text-sm font-bold tracking-wider"
          >
            [ ABORT ]
          </button>
          <button 
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-black rounded transition-colors uppercase text-sm font-bold tracking-widest"
          >
            [ SAVE_LOG ]
          </button>
        </div>
        
      </div>
    </div>
  );
}