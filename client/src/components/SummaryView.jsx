export default function SummaryView({ absentList, onStartNewClass }) {
  return (
    // font-mono နဲ့ Dark Theme Container
    <div className="max-w-2xl mx-auto bg-gray-900 p-8 rounded border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] mt-10 font-mono">
      
      {/* Success Header ပိုင်း (Terminal Log ပုံစံ) */}
      <div className="text-center mb-8 border-b border-gray-700 pb-8">
        <div className="text-green-500 font-bold text-4xl mb-4 tracking-widest">
          [ OK ]
        </div>
        <h2 className="text-2xl font-bold text-green-400 tracking-wider">SYS_STATUS: ROLL_CALL_SAVED</h2>
        <p className="text-gray-400 mt-2">
          <span className="text-green-500">{'>_'}</span> Data successfully committed to database.
        </p>
      </div>

      {/* Absent List ပြမယ့် အပိုင်း (System Warning ပုံစံ) */}
      <div className="bg-black border border-red-500/30 rounded p-6 mb-8 relative overflow-hidden">
        {/* နောက်ခံမှာ အစင်းကြောင်းလေးတွေနဲ့ Vibe ယူထားတယ် */}
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50"></div>
        
        <h3 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-3 tracking-wider">
          <span>{'>_'} WARNING: MISSING_ENTITIES</span>
          <span className="bg-red-900/40 text-red-400 border border-red-500/30 text-xs px-2 py-1 rounded">
            COUNT: {absentList.length}
          </span>
        </h3>
        
        {absentList.length === 0 ? (
          <p className="text-green-400 font-bold bg-green-900/20 p-3 rounded border border-green-500/20">
            {'>_'} SYSTEM_OPTIMAL: 0 entities missing today.
          </p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {absentList.map(student => (
              <li key={student.id} className="bg-gray-800 p-3 rounded border-l-2 border-red-500 border-y border-r border-gray-700 shadow-sm flex flex-col hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-sm">~#</span>
                  <span className="font-bold text-gray-200">{student.id}</span>
                </div>
                <span className="text-sm text-gray-400 ml-6">{student.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Reboot/Restart Button */}
      <button 
        onClick={onStartNewClass}
        className="w-full bg-transparent border border-green-500 text-green-400 hover:bg-green-900/40 font-bold py-3 px-4 rounded transition-colors uppercase tracking-widest flex justify-center items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        [ INIT_NEW_SESSION ]
      </button>
    </div>
  );
}